let allLists = [];
let currentList;

$(function() {
    $('.lists').sortable({
        stop: () => {
            updateIndex();
        }
    });
});

class List {
    constructor(name) {
        this.name = name;
        this.tasks = [];
    }
}

class Task {
    constructor(name) {
        this.name = name;
        this.completed = false;
    }
}

function addTask(e) {
    if (e.which === 13) {
        let myValue = $('#addTask').val();
        let tempTask = new Task(myValue);
        currentList.tasks.push(tempTask);
        printTasks();
        $('#addTask').val('');
    }
}

function removeTask(index) {
    currentList.tasks.splice(index, 1);
}

function saveList(e) {
    if(e.which === 13) {
        let myValue = $('#addList').val();
        let tempObject = new List(myValue, allLists.length);
        currentList = tempObject;
        $('.tasks').html('');
        allLists.push(tempObject);
        if(allLists.length > 0) {
            $('.add-task').show();
        }
        printLists();
        $('#addList').val('');
    }
}

function removeList(index, el) {
    $(el).animate({
        left: '+=100%',
        opacity: 0,
        height: 0
    },300, function() {
        $(el).remove();
        allLists.splice(index, 1);
        if (allLists.length > 0) {
            currentList = allLists[index - 1];
            printTasks();
            printLists();
        } else {
            $('.add-task').hide();
            $('.tasks').html('');
        }
    });
}

function setCurrentList(index) {
    if (currentList.name !== allLists[index].name) {
        currentList = allLists[index];
        printTasks();
    }
}

function printLists() {
    $('.lists').html('');
    $.each(allLists, (index, list) => {$('.lists').prepend(
        `<div class='new-list'>
            <i class="fas fa-trash-alt" onclick='removeList(${index}, $(this).parent())'></i>
            <div class='list-text' onclick='setCurrentList(${index})'>${list.name}</div>
        </div>`
    )});
}

function printTasks() {
    $('.tasks').html('');
    if (currentList.tasks.length > 0) {
        $.each(currentList.tasks, (index, task) => {$('.tasks').prepend(
            `<div class='new-task'>
                ${task.name}
            </div>`
        )});
    }
}

function updateIndex() {
    for (let i = 0; i < allLists.length; i++) {
        $(`.lists .`).attr('onclick', '');
    }
}