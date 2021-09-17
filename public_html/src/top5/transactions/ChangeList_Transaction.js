import jsTPS_Transaction from "../../common/jsTPS.js"

/**
 * ChangeList_Transaction
 * 
 * This class represents a transaction that updates the text
 * for a given list. It will be managed by the transaction stack.
 * 
 * @author Ishan Arefin
 */
export default class ChangeList_Transaction extends jsTPS_Transaction {
    constructor(initModel, initId, initOldText, initNewText) {
        super();
        this.model = initModel;
        this.id = initId;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        this.model.changeList(this.id, this.newText);
    }

    undoTransaction() {
        this.model.changeList(this.id, this.oldText);
    }
}