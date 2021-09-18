/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author Ishan Arefin
 */
 export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            if(!document.getElementById("add-list-button").classList.contains("disabled")){
                let newList = this.model.addNewList("Untitled", ["?", "?", "?", "?", "?"]);
                this.model.loadList(newList.id);
                this.model.saveLists();
            }
        }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }
        document.getElementById("close-button").onmousedown = (event) => {
            this.model.clearWorkspace();
            this.model.unselectAll();
            this.model.closeStatusBar();
        }
        

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                document.getElementById("item-" + i).setAttribute("draggable", "false");
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i - 1));

                    item.appendChild(textInput);

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i - 1, event.target.value);
                            document.getElementById("item-" + i).setAttribute("draggable", "true");
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.restoreList();
                        document.getElementById("item-" + i).setAttribute("draggable", "true");
                    }
                }
            }

            //drag and drop/** 
            
            item.ondragstart = (event) => {
                event.dataTransfer.setData("text/plain", event.target.id);
                event.dataTransfer.effectAllowed = "move";
            }
            item.ondragover = (event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
            }
            item.ondrop = (event) => {
                let id = event.dataTransfer.getData("text/plain");
                let id2 = event.target.id;
                event.preventDefault();

                //console.log(id.charAt(5));
                //console.log(id2.charAt(5));

                //this.model.currentList.moveItem(id.charAt(5)-1, id2.charAt(5)-1);
                this.model.addMoveItemTransaction(id.charAt(5)-1, id2.charAt(5)-1);
                this.model.updateTheView();
                this.model.saveLists();
            } 
            

        }
    }

    registerListSelectHandlers(id) {
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.resetId();
            this.model.unselectAll();
            this.model.resetColors();

            // GET THE SELECTED LIST
            this.model.loadList(id);
            document.getElementById("top5-list-" + id).style.backgroundColor = "#669966";
            document.getElementById("top5-list-" + id).style.color = "black";

            //UPDATE STATUS BAR
            this.model.updateStatusBar();

        }
        //FOR EDITING A LIST NAME 
        document.getElementById("top5-list-" + id).ondblclick = (event) => {
            if(this.model.hasCurrentList()){
                document.getElementById("top5-list-" + id).innerHTML = "";

                let textInput = document.createElement("input");
                textInput.setAttribute("type", "text");
                textInput.setAttribute("id", "top5-list-" + id);
                textInput.setAttribute("value", this.model.getList(this.model.getListIndex(id)).getName());
                (document.getElementById("top5-list-" + id)).appendChild(textInput);

                textInput.ondblclick = (event) => {
                    this.ignoreParentClick(event);
                }
                textInput.onkeydown = (event) => {
                    if(event.key === 'Enter'){
                        this.model.changeListName(id, event.target.value);
                        this.model.updateStatusBar();
                        this.model.loadList(id);
                    }
                }
                textInput.onblur = (event) => {
                    //console.log("Blur");
                    //textInput.onmousedown = (event) => {
                    //    this.model.changeListName(id, this.model.getList(this.model.getListIndex(id)).getName());
                    //}
                    this.model.changeListName(id, event.target.value);
                    this.model.loadList(id);
                }
            }
        }


        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(id).getName();
            //console.log(listName);
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            let child = document.createTextNode(listName)
            deleteSpan.appendChild(child);
            modal.classList.add("is-visible");

            //to get rid of the dialog box 
            let cancel = document.getElementById("dialog-cancel-button");
            cancel.onmousedown = (event) => {
                deleteSpan.removeChild(child);
                modal.classList.remove("is-visible");
            }

            //to confirm and carry out on deleting a list
            let confirm = document.getElementById("dialog-confirm-button");
            confirm.onmousedown = (event) => {
                //listToDeleteIndex = id; listName = lists name
                this.model.removeList(id);
                this.model.saveLists();
                //this.view.refreshLists(this.model.top5Lists);
                //console.log("List is removed.");
                deleteSpan.removeChild(child);
                modal.classList.remove("is-visible");
                this.model.clearWorkspace();
                this.model.unselectAll();
                this.model.closeStatusBar();
            }
        }

        document.getElementById("top5-list-" + id).onmouseover = (event) => {
            if(this.model.currentList == null){
                document.getElementById("top5-list-" + id).style.backgroundColor = "black";
                document.getElementById("top5-list-" + id).style.color = "white";
            }
            else if(this.model.currentList.getId() === id){
                //doooo nothing in particular!
            }
            else{
                document.getElementById("top5-list-" + id).style.backgroundColor = "black";
                document.getElementById("top5-list-" + id).style.color = "white";
            }
        }
        document.getElementById("top5-list-" + id).onmouseleave = (event) => {
            if(this.model.currentList == null){
                document.getElementById("top5-list-" + id).style.backgroundColor = "#e1e4cb";
                document.getElementById("top5-list-" + id).style.color = "black";
            }
            else if(this.model.currentList.getId() === id){
                document.getElementById("top5-list-" + id).style.backgroundColor = "#669966";
                document.getElementById("top5-list-" + id).style.color = "black";
            }
            else{
                document.getElementById("top5-list-" + id).style.backgroundColor = "#e1e4cb";
                document.getElementById("top5-list-" + id).style.color = "black";
            }
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}