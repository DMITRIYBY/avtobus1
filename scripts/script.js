const $bodyContainer = document.querySelector('.list__container')
const $groupBtn = document.querySelector('.group__button')
const $addContactBtn = document.querySelector('.contact__button')
const $pageFreeze = document.querySelector('.disable__page');

let data;

if (localStorage.getItem('data') === null) {
    localStorage.setItem('data', JSON.stringify([]))
    data = JSON.parse(localStorage.getItem('data'));
} else {
    data = JSON.parse(localStorage.getItem('data'));
}

if(data.length === 0){
    document.querySelector('.list__container').innerHTML = `
        <p class="person__name">Список контактов пуст</p>
    `
}

data.map(item => {
    createGroup(item);
})

function createGroup (item) {

    const groupContainer = document.createElement('div');
    groupContainer.classList.add('group__container');

    const contactsContainer = document.createElement('div');
    contactsContainer.classList.add('contacts__container');

    groupContainer.innerHTML = `
    <div class="group__header">
        <h3>${item.group}</h3>
        <button class="show arrow__button" onclick="showGroupContacts(this)">
            <img src="../assets/arrow.svg" alt="">
        </button>
    </div>
    <div class="box" style="width: 100%">
        ${item.contacts.map(person => `
            <div class="contact__container" data-value="${person.group}">
                <p class="person__name">${person.fullName}</p>
                <div class="row__container">
                    <p class="text__regular__18px">${person.number}</p>
                    <button class="button button__edit" onclick="fillEditContact(this)" value="${person.fullName}">
                         <img src="../assets/defaultEdit.svg">
                    </button>
                    <button class="button button__trash" onclick="dropContact(this)" value="${person.fullName}">
                         <img src="../assets/defaultTrash.svg">
                    </button>
                </div>
            </div>
        `).join('')}
    </div>
`;
    $bodyContainer.appendChild(groupContainer);
}

function showGroupContacts(element) {
    const parent = element.parentNode.parentNode;
    const box = parent.querySelector('.box');
    const header = parent.querySelector('.group__header h3');

    const groupIndex = Array.from(parent.parentNode.children).indexOf(parent);
    data[groupIndex].isBoxOpen = !box.style.display || box.style.display === 'none';

    box.style.display = (box.style.display === 'none' || box.style.display === '') ? 'block' : 'none';
    box.style.marginTop = (box.style.display === 'none' || box.style.display === '') ? '0px' : '10px';
    header.style.color = (box.style.display === 'none') ? 'black' : 'var(--default-blue-color)';
    element.style.transform = (box.style.display === 'none') ? 'rotate(180deg)' : 'rotate(0deg)';
}


function dropContact(element){
    const removedGroup = element.parentNode.parentNode.getAttribute('data-value');
    const removedGroupId = data.findIndex(item => item.group === removedGroup);
    const removedContactId = data[removedGroupId].contacts.findIndex(item => item.fullName === element.value);

    data[removedGroupId].contacts.splice(removedContactId, 1);

    updateLocalStorage();
    updateData();

    updateInterface();
}

function fillEditContact(element){
    $pageFreeze.style.display = 'block';

    const $sidebar = document.querySelector('.edit__contact__sidebar');
    $sidebar.style.left = '0';

    const editedGroup = element.parentNode.parentNode.getAttribute('data-value');
    const editedGroupId = data.findIndex(item => item.group === editedGroup);
    const editedContactId = data[editedGroupId].contacts.findIndex(item => item.fullName === element.value);

    document.querySelector('.edit__contact__sidebar #edit__fullName').value = data[editedGroupId].contacts[editedContactId].fullName;
    document.querySelector('.edit__contact__sidebar #edit__phone__number').value = data[editedGroupId].contacts[editedContactId].number;
    document.querySelector('.edit__contact__sidebar .select__group').style.display = 'none';

    document.querySelector('.button__confirm__edit').value = [editedGroupId, editedContactId];

}

function editContact(){
    const editedInfo = document.querySelector('.button__confirm__edit').value;

    const [editedGroupId, editedContactId] = editedInfo.split(",").map(Number);
    const group = data[editedGroupId].contacts[editedContactId].group;
    console.log(group);
    const [new_fullName, new_number, ...args] = getEditedFormValues()
    const new_contact = {
        fullName: new_fullName,
        number: new_number,
        group: group
    };
    if(!isContactExists(new_fullName, new_number, editedGroupId)){
        data[editedGroupId].contacts.splice(editedContactId, 1, new_contact)
    }else {
        alert('Такой пользователь уже существует!')
    }

    updateInterface();
}

function renderGroupsOption(){
    const $selectGroup = document.querySelector('.select__group');
    data.forEach(item =>{
        const option = document.createElement('option');
        option.value = item.group;
        option.textContent = item.group;
        $selectGroup.appendChild(option)
    })
}

$groupBtn.addEventListener('click', () => {
    $pageFreeze.style.display = 'block';
    $groupsList = document.querySelector('.groups__list');
    $groupsList.innerHTML = '';
    drawGroupsList();
    const $sidebar = document.querySelector('.sidebar__container');
    $sidebar.classList.add('open__sidebar');
})
$addContactBtn.addEventListener('click', () => {
    $pageFreeze.style.display = 'block';
    document.querySelector('.select__group').innerHTML = "";
    renderGroupsOption();
    const $sidebar = document.querySelector('.contact__sidebar');
    $sidebar.classList.add('open__sidebar');
})

function closeContainer(element){
    const parent = element.parentNode.parentNode;
    parent.classList.remove('open__sidebar');
    $pageFreeze.style.display = 'none';

    updateInterface();
}

function addContact(){ //добавление контакта в группу
    const [fullName, number, group] = getFormValues();

    const contact = {
        fullName: fullName,
        number: number,
        group: group
    }

    const groupIndex = data.findIndex(item => item.group === group)

    if(!isContactExists(fullName, number, groupIndex)){
        data[groupIndex].contacts.push(contact);
    }else{
        alert(`Контакт ${fullName} уже имеется в группе ${group}`)
    }

    updateLocalStorage();
    updateData();

    updateInterface();
}

function getFormValues(){ //сбор значений из ContactForm
        const fullName = document.querySelector('#fullName').value;
        const number = document.querySelector('#phone__number').value;
        const group = document.querySelector('.select__group').value;

        return [fullName, number, group]
}

function getEditedFormValues(){ //сбор значений из editContactForm
    const fullName = document.querySelector('#edit__fullName').value;
    const number = document.querySelector('#edit__phone__number').value;

    return [fullName, number]
}
function drawGroupsList(){
    $groupsList = document.querySelector('.groups__list');

    data.forEach(item =>{
        const option = `
            <div class="row__container" data-value="${item.group}">
                <div class="text__div">
                    <p>${item.group}</p>
                </div>
                <button class="button button__trash" onclick="dropGroup(this)">
                    <img src="../assets/defaultTrash.svg">
                </button>
            </div>    
        `
        option.value = item.group;
        option.textContent = item.group;
        $groupsList.insertAdjacentHTML('beforeend', option);
    })
}

function dropGroup(element){
    const removedGroup = element.parentNode.getAttribute('data-value');
    const removedGroupId = data.findIndex(item => item.group === removedGroup);

    data.splice(removedGroupId, 1);

    updateLocalStorage();
    updateData();

    updateInterface();
}

function showGroupInput(){
    $groupsList = document.querySelector('.groups__list');

    const new_group =`
        <div class="row__container">
            <input type="text" id="fullName" placeholder="Введите название" style="width: 80%">
            <button class="button button__trash" onclick="updateInterface()">
                 <img src="../assets/defaultTrash.svg">
            </button>
        </div>    
    `

    $groupsList.insertAdjacentHTML('beforeend', new_group);
}

function addGroup(){
    const new_group = document.querySelector('.groups__list .row__container input').value;

    if (!isGroupExists(new_group)) {

        const newGroup = {
            group: new_group,
            contacts: []
        };

        data.push(newGroup);
        updateInterface();
    } else {
        document.querySelector('.groups__list .row__container input').style.border = '2px solid red'
    }

    updateLocalStorage();
    updateData();
}

function updateInterface() {
    $bodyContainer.innerHTML = '';

    data.forEach(item => {
        createGroup(item);
    });

    $groupsList = document.querySelector('.groups__list');
    $groupsList.innerHTML = '';
    drawGroupsList();

    data.forEach((item, index) => {
        const container = $bodyContainer.children[index];
        const box = container.querySelector('.box');
        const header = container.querySelector('.group__header h3');
        if (item.isBoxOpen) {
            box.style.display = 'block';
            box.style.marginTop = '10px';
            header.style.color = 'var(--default-blue-color)';
        } else {
            box.style.display = 'none';
            box.style.marginTop = '0px';
            header.style.color = 'black';
        }
    });

    if(data.length === 0){
        document.querySelector('.list__container').innerHTML = `
        <p class="person__name">Список контактов пуст</p>
    `
    }
}

function updateLocalStorage(){ //для обновления LS
    localStorage.removeItem('data');
    localStorage.setItem('data', JSON.stringify(data));
}
function updateData(){ //для синхронизации LS и data
    data = JSON.parse(localStorage.getItem('data'));
}
function isGroupExists(groupName) {
    return data.some(item => item.group === groupName);
}

function isContactExists(name, number, groupId){
    console.log(groupId)
    if(data[groupId].contacts.some(item => item.fullName === name && item.number === number)){
        return true;
    }
    else{
        return false;
    }

}

document.addEventListener('DOMContentLoaded', function() {
    const phoneNumberInput = document.querySelector('#phone__number');
    const editNumberInput = document.querySelector('#edit__phone__number');

    inputPhoneNumberMask(phoneNumberInput);
    inputPhoneNumberMask(editNumberInput);
});

function inputPhoneNumberMask(inputElement) {
    inputElement.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, ''); // Убираем все нецифровые символы
        let formattedValue = '';

        if (value.length >= 1) {
            formattedValue = '+7 (' + value.substring(1, 4);
        }
        if (value.length >= 4) {
            formattedValue += ') ' + value.substring(4, 7);
        }
        if (value.length >= 7) {
            formattedValue += '-' + value.substring(7, 9);
        }
        if (value.length >= 9) {
            formattedValue += '-' + value.substring(9, 11);
        }

        this.value = formattedValue;
    });
}