const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const defaultCategory = html.match(/id="course-category"[^>]*>\s*<option value="([^"]+)"/)[1];
const cover = 'data:image/jpeg;base64,/9j/AA==';
const personal = () => ({
  id: 'personal', title: 'CEH', category: defaultCategory, note: 'My notes',
  lessons: [{id: 'first', title: 'บทที่ 1', url: '', done: true},
    {id: 'second', title: 'บทที่ 2', url: '', done: false}]
});

// Exercise the application handlers without a browser or external dependencies.
function boot(courses = [], options = {}) {
  const nodes = new Map();
  function element(id) {
    const handlers = {};
    return {id, handlers, value: '', innerHTML: '', textContent: '', hidden: false,
      disabled: false, open: false, scrollTop: 0, dataset: {},
      classList: {toggle() {}, add() {}, remove() {}},
      addEventListener(name, handler) {(handlers[name] ||= []).push(handler);},
      querySelector() {return null;}, setAttribute() {}, focus() {},
      reset() {
        const fields = id === 'lesson-form' ? ['edit-lesson-id','lesson-name','lesson-url','lesson-slides-url'] :
          ['edit-id','course-name','course-provider','course-url','course-description','course-cover-file'];
        fields.forEach(key => nodes.get(key).value = '');
        if(id === 'course-form') {
          nodes.get('course-category').value = defaultCategory;
          nodes.get('course-lessons').value = '1';
          nodes.get('course-hours').value = '0';
        }
      },
      showModal() {this.open = true;},
      close() {this.open = false; (handlers.close || []).forEach(fn => fn());}
    };
  }
  for(const [, id] of html.matchAll(/id="([^"]+)"/g)) {
    assert.equal(nodes.has(id), false, `Duplicate HTML id: ${id}`);
    nodes.set(id, element(id));
  }
  nodes.get('course-category').value = defaultCategory;
  const list = element('lesson-list');
  const note = element('course-note');
  note.value = courses[0]?.note || '';
  const doc = element('document');
  doc.querySelector = selector => selector === '.lesson-list' ? list :
    selector === '#course-note' ? note : nodes.get(selector.slice(1)) || null;
  doc.querySelectorAll = () => [];
  doc.getElementById = id => nodes.get(id);
  const storage = new Map([['coursevault.v1', JSON.stringify({courses, trash: []})]]);
  let failWrite = false;
  const canvases = [];
  doc.createElement = type => {
    assert.equal(type, 'canvas');
    const canvas = {width: 0, height: 0,
      getContext: () => ({fillRect() {}, drawImage() {}}),
      toDataURL: () => cover};
    canvases.push(canvas);
    return canvas;
  };
  class FakeImage {
    constructor() {this.naturalWidth = 2000; this.naturalHeight = 1400;}
    set src(value) {queueMicrotask(() => options.badImage ? this.onerror() : this.onload());}
  }
  const context = vm.createContext({document: doc,
    window: {addEventListener() {}}, Image: FakeImage,
    URL: class extends URL {static createObjectURL() {return 'blob:test';} static revokeObjectURL() {}},
    localStorage: {getItem: key => storage.get(key), setItem(key, value) {
      if(failWrite) throw new Error('Quota exceeded'); storage.set(key, value);
    }}, setTimeout() {}, clearTimeout() {}
  });
  vm.runInContext(source, context);
  return {nodes, doc, storage, canvases,
    run: code => vm.runInContext(code, context),
    state: () => JSON.parse(vm.runInContext('JSON.stringify(state)', context)),
    failWrite: () => {failWrite = true;},
    async emit(id, name, event = {}) {
      for(const handler of nodes.get(id).handlers[name] || []) {
        await handler({preventDefault() {}, ...event});
      }
    },
    async click(button) {
      for(const handler of doc.handlers.click) {
        await handler({target: {closest: () => ({dataset: {}, ...button})}});
      }
    }
  };
}

test('old courses load without a cover and starter courses stay removed', () => {
  const app = boot([personal(), {...personal(), id: 'demo', sample: true}]);
  assert.equal(app.state().courses.length, 1);
  assert.equal(app.state().courses[0].coverImage, '');
  app.run("openCourse('personal')");
  assert.match(app.nodes.get('course-detail').innerHTML, /data-edit-lesson="first"/);
  assert.match(app.nodes.get('course-detail').innerHTML, /id="edit-cover"/);
});

test('lesson pencil edits the title and URL, preserving completion, IDs and order', async () => {
  const app = boot([personal()]);
  app.run("openCourse('personal')");
  await app.click({dataset: {editLesson: 'first'}});
  assert.equal(app.nodes.get('lesson-name').value, 'บทที่ 1');
  app.nodes.get('lesson-name').value = 'Introduction <CEH>';
  app.nodes.get('lesson-url').value = 'https://example.com/lesson';
  await app.emit('lesson-form', 'submit');
  const lessons = app.state().courses[0].lessons;
  assert.deepEqual(lessons.map(l => l.id), ['first', 'second']);
  assert.equal(lessons[0].title, 'Introduction <CEH>');
  assert.equal(lessons[0].done, true);
  assert.equal(lessons[0].url, 'https://example.com/lesson');
  assert.match(app.nodes.get('course-detail').innerHTML, /Introduction &lt;CEH&gt;/);
  assert.equal(boot(app.state().courses).state().courses[0].lessons[0].title, lessons[0].title);
});

test('invalid or cancelled lesson edits leave saved data unchanged', async () => {
  const app = boot([personal()]);
  app.run("openCourse('personal');openLessonForm('first')");
  app.nodes.get('lesson-name').value = '   ';
  await app.emit('lesson-form', 'submit');
  assert.match(app.nodes.get('lesson-error').textContent, /กรุณาใส่ชื่อ/);
  app.nodes.get('lesson-name').value = 'Changed';
  app.nodes.get('lesson-url').value = 'javascript:alert(1)';
  await app.emit('lesson-form', 'submit');
  assert.match(app.nodes.get('lesson-error').textContent, /https/);
  app.run("closeDialog('lesson-dialog')");
  assert.equal(app.state().courses[0].lessons[0].title, 'บทที่ 1');
});

test('editing works at 300 lessons; adding still obeys the limit', async () => {
  const course = personal();
  course.lessons = Array.from({length: 300}, (_,i) => ({id: `l${i}`, title: `Lesson ${i}`, done: false}));
  const app = boot([course]);
  app.run("openCourse('personal');openLessonForm('l299')");
  app.nodes.get('lesson-name').value = 'Final lesson';
  await app.emit('lesson-form', 'submit');
  assert.equal(app.state().courses[0].lessons[299].title, 'Final lesson');
  app.run('openLessonForm()');
  app.nodes.get('lesson-name').value = 'Extra';
  await app.emit('lesson-form', 'submit');
  assert.equal(app.state().courses[0].lessons.length, 300);
  assert.match(app.nodes.get('lesson-error').textContent, /300/);
});

test('uploaded cover is resized, shown on card/detail, and survives reload and validation', async () => {
  const app = boot([personal()]);
  app.run("openCourse('personal');openCourseForm('personal')");
  await app.emit('course-cover-file', 'change', {target: {files: [{type: 'image/png', size: 3000}]}});
  assert.equal(app.canvases[0].width, 1000);
  assert.equal(app.canvases[0].height, 700);
  assert.match(app.nodes.get('cover-preview').innerHTML, /<img/);
  await app.emit('course-form', 'submit');
  assert.equal(app.state().courses[0].coverImage, cover);
  assert.match(app.nodes.get('course-grid').innerHTML, /course-cover-image/);
  assert.match(app.nodes.get('course-detail').innerHTML, /course-cover-image/);
  const savedCourses=JSON.parse(app.storage.get('coursevault.v1')).courses;
  assert.equal(boot(savedCourses).state().courses[0].coverImage, cover);
  assert.equal(app.run(`validateCourses(${JSON.stringify(app.state().courses)})[0].coverImage`), cover);
});

test('cover removal is saved and cancelling a change preserves the original', async () => {
  const app = boot([{...personal(), coverImage: cover}]);
  app.run("openCourseForm('personal')");
  await app.click({id: 'remove-cover'});
  app.run("closeDialog('form-dialog')");
  assert.equal(app.state().courses[0].coverImage, cover);
  app.run("openCourseForm('personal')");
  await app.click({id: 'remove-cover'});
  await app.emit('course-form', 'submit');
  assert.equal(app.state().courses[0].coverImage, '');
});

test('unsupported, oversized, broken and unsafe images are rejected', async () => {
  const app = boot([personal()]);
  app.run("openCourseForm('personal')");
  await assert.rejects(app.run("readCover({type:'image/svg+xml',size:10})"), /JPG/);
  await assert.rejects(app.run("readCover({type:'image/png',size:11000000})"), /10 MB/);
  const bad = boot([], {badImage: true});
  await assert.rejects(bad.run("readCover({type:'image/png',size:10})"), /อ่านรูป/);
  assert.equal(app.run("safeCover('data:image/svg+xml;base64,AAAA')"), '');
  assert.equal(app.run("safeCover('javascript:alert(1)')"), '');
});

test('storage failures retain old cover and lesson and keep the editor open', async () => {
  const app = boot([personal()]);
  app.run("openCourse('personal');openCourseForm('personal')");
  await app.emit('course-cover-file', 'change', {target: {files: [{type: 'image/jpeg', size: 30}]}});
  app.failWrite();
  await app.emit('course-form', 'submit');
  assert.equal(app.state().courses[0].coverImage, '');
  assert.equal(app.nodes.get('form-dialog').open, true);
  app.run("closeDialog('form-dialog');openLessonForm('first')");
  app.nodes.get('lesson-name').value = 'Changed';
  await app.emit('lesson-form', 'submit');
  assert.equal(app.state().courses[0].lessons[0].title, 'บทที่ 1');
  assert.equal(app.nodes.get('lesson-dialog').open, true);
});

test('a late upload cannot overwrite a newly opened form', async () => {
  const app = boot([personal()]);
  app.run("openCourseForm('personal')");
  const pending = app.emit('course-cover-file', 'change', {target: {files: [{type: 'image/png', size: 30}]}});
  app.run('openCourseForm()');
  await pending;
  assert.equal(app.run('draftCover'), '');
  assert.equal(app.nodes.get('course-submit').disabled, false);
});

test('creating a course with a cover and adding a lesson still work', async () => {
  const app = boot();
  app.run('openCourseForm()');
  app.nodes.get('course-name').value = 'New course';
  app.nodes.get('course-lessons').value = '2';
  await app.emit('course-cover-file', 'change', {target: {files: [{type: 'image/webp', size: 30}]}});
  await app.emit('course-form', 'submit');
  const created=app.state().courses[0];
  assert.equal(created.coverImage, cover);
  assert.equal(created.lessons.length, 2);
  app.run(`openCourse(${JSON.stringify(created.id)});openLessonForm()`);
  app.nodes.get('lesson-name').value = 'Another lesson';
  await app.emit('lesson-form', 'submit');
  assert.equal(app.state().courses[0].lessons.length, 3);
  assert.equal(app.state().courses[0].lessons[2].title, 'Another lesson');
});

test('video and slide links save independently and survive reload and backup import', async () => {
  const app = boot([personal()]);
  app.run("openCourse('personal');openLessonForm('first')");
  app.nodes.get('lesson-url').value = 'https://example.com/video';
  app.nodes.get('lesson-slides-url').value = 'https://example.com/slides';
  await app.emit('lesson-form', 'submit');
  const savedCourses = JSON.parse(app.storage.get('coursevault.v1')).courses;
  const lesson = savedCourses[0].lessons[0];
  assert.equal(lesson.url, 'https://example.com/video');
  assert.equal(lesson.slidesUrl, 'https://example.com/slides');
  assert.equal(lesson.done, true);
  assert.match(app.nodes.get('course-detail').innerHTML, /aria-label="เปิดคลิปสอน บทที่ 1"/);
  assert.match(app.nodes.get('course-detail').innerHTML, /aria-label="เปิดสไลด์เรียน บทที่ 1"/);
  const reloaded = boot(savedCourses);
  reloaded.run("openCourse('personal');openLessonForm('first')");
  assert.equal(reloaded.nodes.get('lesson-url').value, lesson.url);
  assert.equal(reloaded.nodes.get('lesson-slides-url').value, lesson.slidesUrl);
  const imported = boot();
  await imported.emit('import-data', 'change', {target: {files: [{size: 1000,
    text: async () => JSON.stringify({app: 'CourseVault', version: 1, courses: savedCourses})}]}});
  assert.deepEqual(imported.state().courses[0].lessons, savedCourses[0].lessons);
});

test('legacy lesson URL fills the video field and the slide field starts empty', () => {
  const course = personal();
  course.lessons[0].url = 'https://example.com/old-lesson';
  const app = boot([course]);
  app.run("openCourse('personal');openLessonForm('first')");
  assert.equal(app.nodes.get('lesson-url').value, course.lessons[0].url);
  assert.equal(app.nodes.get('lesson-slides-url').value, '');
});

test('slides can be used alone and either link can be cleared', async () => {
  const app = boot([personal()]);
  app.run("openCourse('personal');openLessonForm('first')");
  app.nodes.get('lesson-slides-url').value = 'https://example.com/slides';
  await app.emit('lesson-form', 'submit');
  const row = app.run('lessonRow(state.courses[0].lessons[0], 0)');
  assert.match(row, /เปิดสไลด์เรียน/);
  assert.doesNotMatch(row, /เปิดคลิปสอน/);
  assert.match(row, /target="_blank" rel="noopener noreferrer"/);
  app.run("openLessonForm('first')");
  app.nodes.get('lesson-slides-url').value = '';
  app.nodes.get('lesson-url').value = 'https://example.com/video';
  await app.emit('lesson-form', 'submit');
  assert.equal(app.state().courses[0].lessons[0].slidesUrl, '');
  assert.equal(app.state().courses[0].lessons[0].url, 'https://example.com/video');
});

test('invalid slide links cannot replace saved data or render as links', async () => {
  const app = boot([personal()]);
  app.run("openCourse('personal');openLessonForm('first')");
  app.nodes.get('lesson-slides-url').value = 'javascript:alert(1)';
  await app.emit('lesson-form', 'submit');
  assert.match(app.nodes.get('lesson-error').textContent, /สไลด์เรียน/);
  assert.equal(app.state().courses[0].lessons[0].slidesUrl, '');
  assert.equal(app.nodes.get('lesson-dialog').open, true);
  const validated = JSON.parse(app.run(`JSON.stringify(validateCourses([{...state.courses[0],lessons:[{id:'bad',title:'Bad link',slidesUrl:'javascript:alert(1)'}]}]))`));
  assert.equal(validated[0].lessons[0].slidesUrl, '');
});

test('new lessons accept both links and forms reset their fields', async () => {
  const app = boot([personal()]);
  app.run("openCourse('personal');openLessonForm()");
  app.nodes.get('lesson-name').value = 'New lesson';
  app.nodes.get('lesson-url').value = 'https://example.com/video';
  app.nodes.get('lesson-slides-url').value = 'https://example.com/slides';
  await app.emit('lesson-form', 'submit');
  const lesson = app.state().courses[0].lessons[2];
  assert.equal(lesson.url, 'https://example.com/video');
  assert.equal(lesson.slidesUrl, 'https://example.com/slides');
  assert.equal(lesson.done, false);
  app.run('openLessonForm()');
  assert.equal(app.nodes.get('lesson-url').value, '');
  assert.equal(app.nodes.get('lesson-slides-url').value, '');
});
