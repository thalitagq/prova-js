(function (doc) {
  'use strict';

  var games = [];
  var currentBet = [];
  var currentGame = {};
  var total = 0;
  var $gamesButtons = doc.querySelector('[data-js="gamesButtons"]');
  var $numbers = doc.querySelector('[data-js="numbers"]');
  var $bets = doc.querySelector('[data-js="bets"]');

  function init() {
    getGames();
  }

  function getGames() {
    var get = new XMLHttpRequest();
    get.open('GET', './games.json');
    get.send();
    get.addEventListener('readystatechange', function () {
      if (get.readyState === 4) {
        games = JSON.parse(get.responseText).types;
        setGamesInfo();
        setClickEventActionButtons();
      }
    })
  }

  function populateGame(game) {
    var $description = doc.querySelector('[data-js="description"]');
    var $betType = doc.querySelector('[data-js="bet-type"]');
    doc.querySelector(`[data-js='${game.type}']`)
          .setAttribute('style', `background-color: ${game.color}; color: #fff; border-color: ${game.color}`)
    Object.assign(currentGame, game);
    $betType.innerText = game.type;
    $description.innerText = game.description;
    $numbers.innerHTML = ''
    currentBet = [];
    for (var index = 1; index <= game.range; index++) {
      $numbers.insertAdjacentHTML(
        'beforeend',
        `<button type='button' class='circleNumber' data-js=${index} value=${index}>
          ${index}
        </button>`
      );
    }
    setClickEventNumbers();
  }

  function returnGame(gameName) {
    return games.filter(function (item) {
      return item.type === gameName;
    })
  }

  function setGamesInfo() {
    games.forEach(function(game){
      $gamesButtons.insertAdjacentHTML(
        'beforeend', 
        `<button type='button' class='betButton' style='border-color:${game.color}; color: ${game.color}' data-js='${game.type}'>
          ${game.type}
        </button>`
      );                  
    });
    setClickEventBetButtons();
    populateGame(returnGame('Lotofácil')[0]);
  }

  function setClickEventBetButtons() {
    Array.prototype.forEach.call($gamesButtons.childNodes, function (button) {
      button.addEventListener('click', function () {
        if (button.dataset.js === currentGame.type) return;
        doc.querySelector(`[data-js='${currentGame.type}']`)
              .setAttribute('style', `background-color: transparent; color: ${currentGame.color}; border-color: ${currentGame.color}`);
        populateGame(returnGame(button.dataset.js)[0]);
      })
    })
  }

  function setClickEventNumbers() {
    Array.prototype.forEach.call($numbers.childNodes, function (button) {
      button.addEventListener('click', function () {
        if (isInCurrentBet(Number(button.value))) return;
        if (currentBet.length < currentGame['max-number']) {
          currentBet.push(Number(button.value))
          button.setAttribute('style', 'filter: brightness(0.6)');
        }
      })
    })
  }

  function setClickEventActionButtons() {
    var $completeGameBtn = doc.querySelector('[data-js="completeGame"]');
    var $clearGameBtn = doc.querySelector('[data-js="clearGame"]');
    var $addToCartBtn = doc.querySelector('[data-js="addToCart"]');

    $completeGameBtn.addEventListener('click', completeGame);
    $clearGameBtn.addEventListener('click', clearGame);
    $addToCartBtn.addEventListener('click', addToCart);
  }

  function clearGame() {
    currentBet.forEach(function (item) {
      doc.querySelector(`[data-js='${item}']`).setAttribute('style', 'filter: brightness(1)')
    })
    currentBet = [];
  }

  function addToCart() {
    if (currentBet.length !== currentGame['max-number']) {
      return alert('Complete o jogo para continuar!')
    }
    createBetHtml();
    total += currentGame.price;
    doc.querySelector('[data-js="empty-message"]').setAttribute('style', 'display: none');
    doc.querySelector('[data-js="total"]').innerText = String(total.toFixed(2)).replace('.', ',');
    clearGame();
  }

  function createBetHtml() {
    var betColor = returnGame(currentGame.type)[0].color;
    $bets.insertAdjacentHTML('afterbegin',
      `<div class='betRow' data-js='bet${currentGame.type}'>
        <img src='/images/delete.png'/>
        <div class='bet' style='border-color: ${betColor}; color: ${betColor}'>
          <span>${currentBet.sort((a, b) => a - b).join(', ')}</span>
          <div style="display: flex">
            <p style='color: ${betColor}; margin-right: 20px'>${currentGame.type}</p>
            <span style='font-weight: 500'>${String(currentGame.price.toFixed(2)).replace('.', ',')}</span></div>
        </div>
      </div>`
    )
    handlesDeletBet();
  }

  function handlesDeletBet() {
    Array.prototype.map.call($bets.children, function (bet) {
      return Array.prototype.filter.call(bet.children, function (betItem) {        
        return betItem.tagName === 'IMG';
      })
    }).every(function (imgTag) {
        imgTag[0].addEventListener('click',function () {
          total -= returnGame(imgTag[0].parentElement.dataset.js.replace('bet', ''))[0].price;
          doc.querySelector('[data-js="total"]').innerText = String(total.toFixed(2)).replace('.', ',');
          imgTag[0].parentElement.remove();
        
          if (total === 0)
            doc.querySelector('[data-js="empty-message"]').setAttribute('style', 'display: block');
          return false;
      })
    })
  }

  function completeGame() {
    var randomBet = [];
    while(currentBet.length < currentGame['max-number']){
      randomBet = Math.ceil(Math.random() * (currentGame.range))
      if(!isInCurrentBet(randomBet))
        doc.querySelector(`[data-js='${randomBet}']`).click();
    }
  }

  function isInCurrentBet(number) {
    return currentBet.some(function (item) {
      return number === item;
    })
  }

  init();

})(document)