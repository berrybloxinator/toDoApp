let allLists = [];
let currentList;

$(function() {
    $('#lists').sortable({
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

    addTask(e) {
        if (e.which === 13) {
            let myValue = $('#addTask').val();
            if(!checkDuplicateName(myValue, this.tasks)) {
                let tempTask = new Task(myValue);
                this.tasks.push(tempTask);
                printTasks();
                $('#addTask').val('');
            }
        }
    }

    removeTask(index, el) {
        $(el).parent().remove();
        this.tasks.splice(index, 1);
    }
}

class Task {
    constructor(name) {
        this.name = name;
    }
}

function clearCompletedTasks() {
    for (let i = 0; i < currentList.tasks.length; i++) {
        let input = $('.tasks .new-task input').toArray();
        if(input[i].checked) {
            currentList.removeTask(i, input[i]);
            i--;
        }
    }
    printTasks();
}

function clearAll() {
    for (let i = 0; i < currentList.tasks.length; i++) {
        let input = $('.tasks .new-task input').toArray();
        currentList.removeTask(i, input[i]);
        i--;
    }
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
                $('.clearCompletedTasks').show();
                $('.clearAll').show();
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
        if (allLists.length > 1 && allLists[index + 1] === undefined) {
            if(allLists[index].name === currentList.name) {
                currentList = allLists[index - 1];
            }
            allLists.splice(index, 1);
            printTasks();
            printLists();
        } else if (allLists.length > 1 && allLists[index + 1] !== undefined) {
            if(allLists[index].name === currentList.name) {
                allLists.splice(index, 1);
                currentList = allLists[index];
            } else {
                allLists.splice(index, 1);
            }
            printTasks();
            printLists();
        } else {
            allLists.splice(index, 1);
            $('.add-task').hide();
            $('.clearCompletedTasks').hide();
            $('.clearAll').hide();
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
                <input type='checkbox'>
            </div>`
        )});
    }
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
}

function loseFocusTaskName(el, index) {
    currentList.tasks[index].name = $(el).text();
    $(el).attr('contenteditable', 'false');
    $('.task-text').css('cursor', 'pointer');
    document.activeElement.blur();
    console.log(currentList.tasks);
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