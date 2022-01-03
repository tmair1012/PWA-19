// Hold the connection to db
let db;

//connection to indexedDB database
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result
    //new store table
    db.createObjectStore('new_budget', { autoIncrement: true });
};

//if successful
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadBudget();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// If there is an attempt to submit a new budget
function saveRecord(record) {

    // open new transaction with database
    const transaction = db.transaction(['new_budget'], 'readwrite');

    //access the object store
    const budgetObjectStore = transaction.objectStore('new_budget')

    budgetObjectStore.add(record);
};

function uploadBudget() {
    // open the transaction
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetObjectStore = transaction.objectStore('new_budget');

    //set records to a variable
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json' 
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse)
                }
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_budget');
                budgetObjectStore.clear();

                alert('all budgets have been submitted')
            })
            .catch(err => {
                console.log(err);
            })
        }
    }
}

//listen for when the app comes back online
window.addEventListener('online', uploadBudget);