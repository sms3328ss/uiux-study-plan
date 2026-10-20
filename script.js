const form = document.querySelector('#plan-form');
const editor = document.querySelector('#editor');
const preview = document.querySelector('#preview');
const subject = document.querySelector('#subject');
const task = document.querySelector('#task');
const minutes = document.querySelector('#minutes');
const formError = document.querySelector('#form-error');
const saveButton = document.querySelector('#save-button');
const previewMessage = document.querySelector('#preview-message');
const listMessage = document.querySelector('#list-message');
const savedList = document.querySelector('#saved-list');
const storageKey = 'today-study-plans';
let plans = [];
let currentPlan = null;

// 저장한 계획은 같은 브라우저에서 다시 확인할 수 있다.
try {
  const saved = JSON.parse(localStorage.getItem(storageKey)) || [];
  if (Array.isArray(saved)) {
    plans = saved.filter(function(plan) {
      return plan && typeof plan.id === 'string' &&
        typeof plan.subject === 'string' && typeof plan.task === 'string' &&
        ['15', '30', '60', '90'].includes(plan.minutes);
    });
  }
} catch (error) {
  listMessage.textContent = '저장한 계획을 읽지 못했습니다. 브라우저의 저장 설정을 확인해 주세요.';
  listMessage.classList.add('error');
}

function showPreview(plan) {
  currentPlan = plan;
  subject.value = plan.subject;
  task.value = plan.task;
  minutes.value = plan.minutes;
  document.querySelector('#preview-subject').textContent = plan.subject;
  document.querySelector('#preview-task').textContent = plan.task;
  document.querySelector('#preview-minutes').textContent = plan.minutes + '분';
  previewMessage.textContent = plan.id ? '목록에 저장된 계획입니다. 수정하면 새 계획으로 저장할 수 있습니다.' : '';
  previewMessage.classList.remove('error');
  saveButton.disabled = Boolean(plan.id);
  saveButton.textContent = plan.id ? '저장된 계획' : '이 계획 저장하기';
  formError.hidden = true;
  editor.hidden = true;
  preview.hidden = false;
  document.querySelector('#preview-title').focus();
}

form.addEventListener('submit', function(event) {
  event.preventDefault();
  let message = '';
  let target = subject;
  if (subject.value.trim() === '') {
    message = '과목 이름을 입력해 주세요.';
  } else if (task.value.trim() === '') {
    message = '공부할 내용을 입력해 주세요.';
    target = task;
  } else if (!['15', '30', '60', '90'].includes(minutes.value)) {
    message = '공부 시간을 선택해 주세요.';
    target = minutes;
  }
  if (message !== '') {
    formError.textContent = message;
    formError.hidden = false;
    target.focus();
    return;
  }
  showPreview({
    subject: subject.value.trim(),
    task: task.value.trim(),
    minutes: minutes.value
  });
});

document.querySelector('#edit-button').addEventListener('click', function() {
  preview.hidden = true;
  editor.hidden = false;
  subject.focus();
});

document.querySelector('#reset-button').addEventListener('click', function() {
  form.reset();
  currentPlan = null;
  formError.hidden = true;
  previewMessage.textContent = '';
  preview.hidden = true;
  editor.hidden = false;
  subject.focus();
});

function writePlans(nextPlans) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(nextPlans));
    plans = nextPlans;
    return true;
  } catch (error) {
    listMessage.textContent = '저장 공간을 사용할 수 없습니다. 브라우저 설정을 확인한 뒤 다시 시도해 주세요.';
    listMessage.classList.add('error');
    return false;
  }
}

saveButton.addEventListener('click', function() {
  if (!currentPlan || currentPlan.id) return;
  previewMessage.classList.add('error');
  const duplicate = plans.some(function(plan) {
    return plan.subject === currentPlan.subject && plan.task === currentPlan.task && plan.minutes === currentPlan.minutes;
  });
  if (duplicate) {
    previewMessage.textContent = '같은 계획이 이미 저장되어 있습니다. 아래 목록에서 다시 열어 주세요.';
    return;
  }
  if (plans.length >= 10) {
    previewMessage.textContent = '계획은 10개까지 저장할 수 있습니다. 필요 없는 계획을 삭제한 뒤 다시 저장해 주세요.';
    return;
  }
  const newPlan = {
    id: crypto.randomUUID(),
    subject: currentPlan.subject,
    task: currentPlan.task,
    minutes: currentPlan.minutes
  };
  if (!writePlans(plans.concat(newPlan))) {
    previewMessage.textContent = '저장하지 못했습니다. 브라우저 저장 설정을 확인한 뒤 다시 시도해 주세요.';
    return;
  }
  currentPlan = newPlan;
  saveButton.disabled = true;
  saveButton.textContent = '저장 완료';
  previewMessage.classList.remove('error');
  previewMessage.textContent = '계획을 저장했습니다. 아래 목록에서 다시 열 수 있습니다.';
  listMessage.textContent = '';
  listMessage.classList.remove('error');
  renderPlans();
});

function makeButton(text, className) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = text;
  button.className = className;
  return button;
}

function renderPlans() {
  savedList.replaceChildren();
  document.querySelector('#saved-count').textContent = plans.length + '개';
  document.querySelector('#empty-message').hidden = plans.length > 0;
  plans.forEach(function(plan) {
    const item = document.createElement('li');
    const title = document.createElement('h3');
    title.textContent = plan.subject;
    const description = document.createElement('p');
    description.textContent = plan.task + ' / ' + plan.minutes + '분';
    const actions = document.createElement('div');
    actions.className = 'actions';
    const openButton = makeButton('다시 열기', 'secondary');
    const deleteButton = makeButton('삭제', 'secondary');
    openButton.setAttribute('aria-label', plan.subject + ' 계획 다시 열기');
    deleteButton.setAttribute('aria-label', plan.subject + ' 계획 삭제');
    actions.append(openButton, deleteButton);

    const confirmBox = document.createElement('div');
    confirmBox.className = 'confirm';
    confirmBox.hidden = true;
    const question = document.createElement('p');
    question.textContent = '이 계획을 삭제할까요? 삭제하면 목록에서 사라집니다.';
    const confirmActions = document.createElement('div');
    confirmActions.className = 'actions';
    const yesButton = makeButton('삭제하기', 'danger');
    const noButton = makeButton('취소', 'secondary');
    confirmActions.append(yesButton, noButton);
    confirmBox.append(question, confirmActions);
    item.append(title, description, actions, confirmBox);
    savedList.append(item);

    openButton.addEventListener('click', function() {
      showPreview(plan);
    });
    deleteButton.addEventListener('click', function() {
      confirmBox.hidden = false;
      noButton.focus();
    });
    noButton.addEventListener('click', function() {
      confirmBox.hidden = true;
      listMessage.classList.remove('error');
      listMessage.textContent = '삭제를 취소했습니다. 계획은 그대로 남아 있습니다.';
      deleteButton.focus();
    });
    yesButton.addEventListener('click', function() {
      const nextPlans = plans.filter(function(item) { return item.id !== plan.id; });
      if (!writePlans(nextPlans)) return;
      if (currentPlan && currentPlan.id === plan.id) {
        currentPlan = { subject: plan.subject, task: plan.task, minutes: plan.minutes };
        saveButton.disabled = false;
        saveButton.textContent = '이 계획 저장하기';
        previewMessage.textContent = '목록에서 삭제했습니다. 필요하면 이 내용을 다시 저장할 수 있습니다.';
      }
      listMessage.classList.remove('error');
      listMessage.textContent = '계획을 삭제했습니다. 새 계획을 만들거나 다른 계획을 열어 보세요.';
      renderPlans();
      document.querySelector('#saved-title').setAttribute('tabindex', '-1');
      document.querySelector('#saved-title').focus();
    });
  });
}

renderPlans();
