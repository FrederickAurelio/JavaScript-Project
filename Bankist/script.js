"use strict";
// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2019-02-18T10:29:59.371Z',
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2023-02-12T10:01:20.894Z',
        '2023-02-15T10:01:20.894Z',
        '2023-02-17T09:43:26.374Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-05-27T17:01:17.194Z',
        '2020-07-11T23:36:17.929Z',
        '2020-07-12T10:51:36.790Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];
/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function (date, locale) {
    const calcdayPassed = (date1, date2) => Math.floor(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const dayPassed = calcdayPassed(new Date(), date);
    if (dayPassed === 0) { return "Today" }
    else if (dayPassed === 1) { return "Yesterday" }
    else if (dayPassed <= 7) { return `${dayPassed} days ago` }
    else {
        return new Intl.DateTimeFormat(locale).format(date);
    }
}

const formatCur = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, { style: "currency", currency: currency }).format(value)
}

const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = ``;

    const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

    movs.forEach(function (mov, i) {
        const type = mov > 0 ? `deposit` : `withdrawal`;

        const dates = new Date(acc.movementsDates[i]);
        const displayDate = formatMovementDate(dates, acc.locale);

        const formattedMov = formatCur(mov, acc.locale, acc.currency);

        const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
      `
        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
}

const calcPrintBalance = function (acc) {
    acc.balance = acc.movements.reduce(function (acc, mov) {
        return acc + mov;
    });
    labelBalance.textContent = `${formatCur(acc.balance, acc.locale, acc.currency)}`;
}

const calcDisplaySummary = function (acc) {
    const income = acc.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);
    const outcome = acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = formatCur(Math.abs(outcome), acc.locale, acc.currency);
    const interest = acc.movements.filter(mov => mov > 0).map(depo => depo * acc.interestRate / 100).filter(int => int >= 1).reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
    accs.forEach(function (acc) {
        acc.username = acc.owner.toLowerCase().split(" ").map(words => words[0]).join("");
    });
}
createUsernames(accounts);

const updateUI = function (acc) {
    displayMovements(acc);
    calcPrintBalance(acc);
    calcDisplaySummary(acc);
}

const startLogOutTimer = function () {
    const tick = function () {
        const min = String(Math.floor(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${min}:${sec}`;
        if (time === 0) {
            clearInterval(timer)
            containerApp.style.opacity = 0;
            labelWelcome.textContent = `Log in to get started`;
            currentAccount = null;
        }
        time -= 1;
    }
    let time = 300;
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
}

// LOG IN
let currentAccount, timer;
btnLogin.addEventListener("click", function (e) {
    e.preventDefault();

    currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
    
    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        // Display UI and Welcome Message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`
        containerApp.style.opacity = 1;

        // Current Dates
        const now = new Date();
        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        }
        // const locale = navigator.language;
        labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = "";
        inputLoginPin.blur();
        inputLoginUsername.blur();

        sorted = false;

        // Timer
        if (timer) clearInterval(timer);
        timer = startLogOutTimer();

        //Update UI
        updateUI(currentAccount);
    }
});
// TRANSFER
btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();
    const amount = Number(inputTransferAmount.value);
    const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

    if (amount > 0 && receiverAcc && currentAccount.balance >= amount && receiverAcc.username !== currentAccount.username) {
        // Doing the transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);
        // Add dates
        const dates = new Date().toISOString();
        currentAccount.movementsDates.push(dates);
        receiverAcc.movementsDates.push(dates);
        // Update Interface
        updateUI(currentAccount);
    }
    // Clear Input Fields
    inputTransferAmount.value = inputTransferTo.value = "";
    inputTransferAmount.blur();
    inputTransferTo.blur();

    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer()
});

// LOAN
btnLoan.addEventListener("click", function (e) {
    e.preventDefault();
    const amount = Math.floor(inputLoanAmount.value);
    if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
        setTimeout(function () {
            // Add Movements
            currentAccount.movements.push(amount);
            // Add Movements Dates
            const dates = new Date().toISOString();
            currentAccount.movementsDates.push(dates);
            // Update UI
            updateUI(currentAccount);
        }, 2500);
    }
    inputLoanAmount.value = "";
    inputLoanAmount.blur();

    // Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer()
});

// CLOSE ACCOUNT
btnClose.addEventListener("click", function (e) {
    e.preventDefault();
    if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
        const index = accounts.findIndex(acc => acc.username === currentAccount.username);
        // Delete Acc
        accounts.splice(index, 1);
        // Hide UI
        containerApp.style.opacity = 0;
        // Clear Input Fields
        inputClosePin.value = inputCloseUsername.value = "";
        inputClosePin.blur();
        inputCloseUsername.blur();
    }
});

// SORT 
let sorted = false;
btnSort.addEventListener("click", function () {
    sorted = !sorted;
    displayMovements(currentAccount, sorted);
});