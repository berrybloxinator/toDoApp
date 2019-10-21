let allLists = [];
let tempLists;
let currentList;
let currentIndex;

class List {
    constructor(name) {
        this.name = name;
        this.tasks = [];
    }

    addTask(e) {
        if (e.which === 13) {
            let myValue = $('#addTask').val();
            if(!checkName(myValue, this.tasks)) {
                let tempTask = new Task(myValue);
                this.tasks.push(tempTask);
                localStorage.setItem('lists', JSON.stringify(allLists));
                printTasks();
                $('#addTask').val('');
                $('.right-container').scrollTop($('.right-container')[0].scrollHeight);
            }
        }
    }

    removeTask(index, el) {
        $(el).parent().remove();
        this.tasks.splice(index, 1);
        localStorage.setItem('lists', JSON.stringify(allLists));
    }
}

class Task {
    constructor(name) {
        this.name = name;
        this.completed = false;
    }
}

$(function() {
    currentIndex = JSON.parse(localStorage.getItem('currentListIndex'));
    tempLists = JSON.parse(localStorage.getItem('lists') || '[]');
    if (tempLists.length > 0) {
        for (let i = 0; i < tempLists.length; i++) {
            let tempList = new List(tempLists[i].name);
            tempList.tasks = tempLists[i].tasks;
            allLists.push(tempList);
        }

        currentList = allLists[currentIndex];
        $('.add-task').show();
        $('.clearCompletedTasks').show();
        $('.clearAll').show();
        $('.clearEverything').show();
        printLists();
        printTasks();

        let activeList = $('#lists > div').toArray();
        $(activeList[currentIndex]).addClass('light-gray');
        $('.left-container').scrollTop($('.left-container')[0].scrollHeight);
    }

    $('#lists').sortable({
        //https://stackoverflow.com/questions/1601827/jquery-ui-sortable-how-to-determine-current-location-and-new-location-in-update
        start: (e, ui) => {
            $(this).attr('data-previndex', ui.item.index());
        },

        stop: (e, ui) => {
            let oldIndex = $(this).attr('data-previndex');
            $(this).removeAttr('data-previndex');
            let newIndex = ui.item.index();
            if (currentIndex === oldIndex) {
                currentIndex = newIndex;
            } else if (currentIndex < oldIndex && currentIndex >= newIndex) {
                currentIndex++;
            } else if (currentIndex > oldIndex && currentIndex <= newIndex) {
                currentIndex--;
            }

            localStorage.setItem('currentListIndex', JSON.stringify(currentIndex));
            updateArray(oldIndex, newIndex);
        }
    });
});

function clearCompletedTasks() {
    for (let i = 0; i < currentList.tasks.length; i++) {
        let input = $('.tasks .new-task input').toArray();
        if(input[i].checked) {
            currentList.removeTask(i, $(input[i]).parent());
            i--;
        }
    }
    printTasks();
    localStorage.setItem('lists', JSON.stringify(allLists));
}

function clearAll() {
    currentList.tasks = [];
    printTasks();
    localStorage.setItem('lists', JSON.stringify(allLists));
}

function saveList(e) {
    if(e.which === 13) {
        let myValue = $('#addList').val();
        if(!checkName(myValue, allLists)) {
            let tempObject = new List(myValue);
            currentList = tempObject;
            $('.tasks').html('');
            allLists.push(tempObject);
            currentIndex = allLists.length - 1;
            localStorage.setItem('currentListIndex', JSON.stringify(currentIndex));
            localStorage.setItem('lists', JSON.stringify(allLists));
            $('.add-task').show();
            $('.clearCompletedTasks').show();
            $('.clearAll').show();
            $('.clearEverything').show();
            printLists();
            $('#addList').val('');
            let activeList = $('#lists > div').toArray();
            $(activeList[currentIndex]).addClass('light-gray');
            $('.left-container').scrollTop($('.left-container')[0].scrollHeight);
        }
    }
}

function removeList(index, el) {
    $(el).animate({
        left: '+=100%',
        opacity: 0,
        height: 0
    },300, function() {
        $(el).remove();
        if (allLists.length > 1 && allLists[index + 1] === undefined) {
            if(allLists[index].name === currentList.name) {
                currentList = allLists[index - 1];
                currentIndex = index - 1;
                localStorage.setItem('currentListIndex', JSON.stringify(currentIndex));
            }
            allLists.splice(index, 1);
            printTasks();
            printLists();
            let activeList = $('#lists > div').toArray();
            $(activeList[currentIndex]).addClass('light-gray');
        } else if (allLists.length > 1 && allLists[index + 1] !== undefined) {
            if(allLists[index].name === currentList.name) {
                allLists.splice(index, 1);
                currentList = allLists[index];
                localStorage.setItem('currentListIndex', JSON.stringify(currentIndex));
            } else {
                allLists.splice(index, 1);
                if(currentIndex > index) {
                    currentIndex--;
                    localStorage.setItem('currentListIndex', JSON.stringify(currentIndex));
                }
            }
            printTasks();
            printLists();
            let activeList = $('#lists > div').toArray();
            $(activeList[currentIndex]).addClass('light-gray');
        } else {
            allLists.splice(index, 1);
            localStorage.setItem('currentListIndex', null);
            $('.add-task').hide();
            $('.clearCompletedTasks').hide();
            $('.clearAll').hide();
            $('.clearEverything').hide();
            $('.tasks').html('');
            $('.title').html('');
        }

        localStorage.setItem('lists', JSON.stringify(allLists));
    });
}

function setCurrentList(index) {
    currentList = allLists[index];
    currentIndex = index;
    localStorage.setItem('currentListIndex', JSON.stringify(currentIndex));
    $('.title').html(currentList.name);
    printTasks();
    printLists();
    let activeList = $('#lists > div').toArray();
    $(activeList[currentIndex]).addClass('light-gray');
}

function printLists() {
    $('#lists').html('');
    $('.title').html(currentList.name);
    $.each(allLists, (index, list) => {$('#lists').append(
        `<div class='new-list'>
            <i class='fas fa-trash-alt' onclick='removeList(${index}, $(this).parent())'></i>
            <div class='list-text' onclick='setCurrentList(${index})'>${list.name}</div>
        </div>`
    )});
}

function printTasks() {
    $('.tasks').html('');
    if (currentList.tasks.length > 0) {
        $.each(currentList.tasks, (index, task) => {$('.tasks').append(
            `<div class='new-task'>
                <i class='fas fa-trash-alt' onclick='currentList.removeTask(${index}, this);printTasks();'></i>
                <div class='task-text' onclick='editTaskName(this);' onkeyup='enterTaskName(event, this, ${index})'
                onblur='loseFocusTaskName(this, ${index})'>${task.name}</div>
                <div class='checkboxFive'>
                    <input type='checkbox' id='test${index}'>
                    <label for='test${index}' onclick='changeCheck(${index})'></label>
                </div> 
            </div>`
        )});
    }

    displayCheck();
}

function editTaskName(el) {
    //https://stackoverflow.com/questions/6139107/programmatically-select-text-in-a-contenteditable-html-element/6150060#6150060
    let range = document.createRange();
    range.selectNodeContents(el);
    let sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    $(el).attr('contenteditable', 'true');
    $('div[contenteditable="true"]').trigger('focus');
    $('.task-text').css('cursor', 'auto');
}

function enterTaskName(e, el, index) {
    switch(e.which) {
        case 13:
            currentList.tasks[index].name = $(el).text();
            $(el).attr('contenteditable', 'false');
            $('.task-text').css('cursor', 'pointer');
            $(el).blur();
    }

    localStorage.setItem('lists', JSON.stringify(allLists));
}

function loseFocusTaskName(el, index) {
    currentList.tasks[index].name = $(el).text();
    $(el).attr('contenteditable', 'false');
    $('.task-text').css('cursor', 'pointer');
    localStorage.setItem('lists', JSON.stringify(allLists));
}

function updateArray(oldIndex, newIndex) {
    let del = $('#lists .new-list i').toArray();
    let listText = $('#lists .new-list div').toArray();
    for (let i = 0; i < allLists.length; i++) {
        $(del[i]).attr('onclick', `removeList(${i}, $(this).parent())`);
        $(listText[i]).attr('onclick', `setCurrentList(${i})`);
    }

    let l = allLists.splice(oldIndex, 1);
    allLists.splice(newIndex, 0, l[0]);
    localStorage.setItem('lists', JSON.stringify(allLists));
}

function checkName(value, array) {
    if (value === '') {
        alert(`You can't make an item with an empty name`);
        return true;
    }
    for (let obj of array) {
        if (obj.name === value) {
            alert(`You can't have more than one item with the same name`);
            return true;
        }
    }

    return false;
}

function changeCheck(index) {
    let input = $('.tasks .new-task input').toArray();
    let currentInput = input[index].checked;
    currentList.tasks[index].completed = !currentInput;
    localStorage.setItem('lists', JSON.stringify(allLists));
}

function displayCheck() {
    let input = $('.tasks .new-task input').toArray();
    for (let i = 0; i < currentList.tasks.length; i++) {
        input[i].checked = currentList.tasks[i].completed;
    }
}

function clearEverything() {
    if(confirm('Are you sure you want to delete all lists and tasks?')) {
        localStorage.clear();
        allLists = [];
        printLists();
        $('.add-task').hide();
        $('.clearCompletedTasks').hide();
        $('.clearAll').hide();
        $('.clearEverything').hide();
        $('.tasks').html('');
        $('.title').html('');
    }
}