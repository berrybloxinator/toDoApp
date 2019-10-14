let allLists = [];
let currentList;

$(function() {
    $('.lists').sortable({
        //https://stackoverflow.com/questions/1601827/jquery-ui-sortable-how-to-determine-current-location-and-new-location-in-update
        start: (e, ui) => {
            $(this).attr('data-previndex', ui.item.index());
        },

        stop: (e, ui) => {
            let oldIndex = $(this).attr('data-previndex');
            $(this).removeAttr('data-previndex');
            let newIndex = ui.item.index();
            updateArray(oldIndex, newIndex);
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
        if(!checkDuplicateName(myValue, currentList.tasks)) {
            let tempTask = new Task(myValue);
            currentList.tasks.push(tempTask);
            printTasks();
            $('#addTask').val('');
        }
    }
}

function removeTask(index) {
    currentList.tasks.splice(index, 1);
}

function saveList(e) {
    if(e.which === 13) {
        let myValue = $('#addList').val();
        if(!checkDuplicateName(myValue, allLists)) {
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
}

function removeList(index, el) {
    $(el).animate({
        left: '+=100%',
        opacity: 0,
        height: 0
    },300, function() {
        $(el).remove();
        allLists.splice(index, 1);
        if (allLists.length > 0 && allLists[index] !== undefined) {
            currentList = allLists[index];
            printTasks();
            printLists();
        } else if (allLists.length > 0 && allLists[index] === undefined) {
            currentList = allLists[index - 1];
            printTasks();
            printLists();
        } else {
            $('.add-task').hide();
            $('.tasks').html('');
            $('.title').html('');
        }
    });
}

function setCurrentList(index) {
    currentList = allLists[index];
    $('.title').html(currentList.name);
    printTasks();
}

function printLists() {
    $('.lists').html('');
    $('.title').html(currentList.name);
    $.each(allLists, (index, list) => {$('.lists').append(
        `<div class='new-list'>
            <i class="fas fa-trash-alt" onclick='removeList(${index}, $(this).parent())'></i>
            <div class='list-text' onclick='setCurrentList(${index})'>${list.name}</div>
        </div>`
    )});
}

function printTasks() {
    $('.tasks').html('');
    if (currentList.tasks.length > 0) {
        $.each(currentList.tasks, (index, task) => {$('.tasks').append(
            `<div class='new-task'>
                ${task.name}
            </div>`
        )});
    }
}

function updateArray(oldIndex, newIndex) {
    let del = $('.lists .new-list i').toArray();
    let listText = $('.lists .new-list div').toArray();
    for (let i = 0; i < allLists.length; i++) {
        $(del[i]).attr('onclick', `removeList(${i}, $(this).parent())`);
        $(listText[i]).attr('onclick', `setCurrentList(${i})`);
    }

    let l = allLists.splice(oldIndex, 1);
    allLists.splice(newIndex, 0, l[0]);
}

function checkDuplicateName(value, array) {
    for (let obj of array) {
        if (obj.name === value) {
            alert(`You can't have more than one item with the same name`);
            return true;
        }
    }

    return false;
}