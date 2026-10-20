const form = document.querySelector('#plan-form');
const editor = document.querySelector('#editor');
const preview = document.querySelector('#preview');
const subject = document.querySelector('#subject');
const task = document.querySelector('#task');
const minutes = document.querySelector('#minutes');
const formError = document.querySelector('#form-error');

form.addEventListener('submit', function(event) {
  event.preventDefault();
  let message = '';
  let target = subject;
  if (subject.value.trim() === '') {
    message = '과목 이름을 입력해 주세요.';
  } else if (task.value.trim() === '') {
    message = '공부할 내용을 입력해 주세요.';
    target = task;
  } else if (minutes.value === '') {
    message = '공부 시간을 선택해 주세요.';
    target = minutes;
  }
  if (message !== '') {
    formError.textContent = message;
    formError.hidden = false;
    target.focus();
    return;
  }
  formError.hidden = true;
  document.querySelector('#preview-subject').textContent = subject.value.trim();
  document.querySelector('#preview-task').textContent = task.value.trim();
  document.querySelector('#preview-minutes').textContent = minutes.value + '분';
  editor.hidden = true;
  preview.hidden = false;
  document.querySelector('#preview-title').focus();
});

document.querySelector('#edit-button').addEventListener('click', function() {
  preview.hidden = true;
  editor.hidden = false;
  subject.focus();
});

document.querySelector('#reset-button').addEventListener('click', function() {
  form.reset();
  formError.hidden = true;
  preview.hidden = true;
  editor.hidden = false;
  subject.focus();
});
