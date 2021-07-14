feather.replace();

(function(window, document){
  'use strict';

   var listGames = [];
   var cart = [];
   var listOfNumbers = [];
   var selectedGame;
   var $divListGames = getElement('[class=list-of-games]');
   var $divNumberGame = getElement('[class="games-list-numbers"]');
   var $cartList = getElement('[class="cart-list"]');
   var $alert = document.getElementsByClassName("alert-warning");

   function getElement(attributes){
     return document.querySelector(attributes);
   }

   function initialGameSelect(){
     document.querySelector('[class="game-choose-button"]').click();
   }

   function getAllGames() {
     var ajax = new XMLHttpRequest();
     ajax.open('GET', 'data/games.json', true);
     ajax.send()

     ajax.onreadystatechange = () =>  {
       if (ajax.readyState === 4 && ajax.status === 200) {
         listGames.push(JSON.parse(ajax.responseText).types);
         createGamesListButtons();
         initialGameSelect();
       }
     }
     createEventForButtonOptions();
     closeAlert();
   }

   function createGamesListButtons() {
     listGames[0].map(game => {
       var newButton = document.createElement('button');
       var newButtonText = document.createTextNode(game.type);
       newButton.appendChild(newButtonText);

       newButton.setAttribute('class', 'game-choose-button');
       newButton.setAttribute('game-type', game.type);
       newButton.setAttribute('game-type-is-selected', 'false');

       newButton.style.border = `solid ${game.color}`;
       newButton.style.color = game.color;

       $divListGames.appendChild(newButton);
     })
     var $buttonSelectedGame = document.querySelectorAll('[class="game-choose-button"]');
     createEventForButtonGames($buttonSelectedGame);
   }

   function createEventForButtonGames(buttons) {
     buttons.forEach(button => {
       button.addEventListener('click', (event) => {
         resetDataButtons();
         event.preventDefault();
         setSelectedGame(button.getAttribute('game-type'))
         button.style.color = '#FFFF';
         button.style.background = selectedGame[0].color;
         addGameDescription();
         createNumbersForGame();
       })
     })
   }

   function createEventForNumberButton(buttons){
     buttons.forEach(button => {
       button.addEventListener('click', (event) => {
         event.preventDefault();

         if(listOfNumbers.indexOf(String(button.innerHTML)) !== -1){
           button.style.background = '#ADC0C4';
           var numberIndex = listOfNumbers.indexOf(button.innerHTML);
           listOfNumbers.splice(numberIndex, 1);
         } else if(listOfNumbers.length >= selectedGame[0]['max-number']){
          var content = document.createTextNode('Quantidade de números máxima selecionada!');

          $alert[1].appendChild(content);
          $alert[1].setAttribute('class', 'alert alert-warning alert-dismissible fade show');
          return;

         }
         else {
           button.setAttribute('number-option-is-selected', 'true');
           button.style.background = '#27C383';
           listOfNumbers.push(button.innerHTML);
         }
       })
     })
   }

   function resetDataButtons(){
     listOfNumbers = [];
     var $buttonSelectedGame = document.querySelectorAll('[class="game-choose-button"]');
     $buttonSelectedGame.forEach(button => {
       var game = listGames[0].filter(game => game.type === button.getAttribute('game-type'));
       button.style.border = `solid ${game[0].color}`;
       button.style.color = game[0].color;
       button.style.background = '#FFFF'
     })
     clearSelectedNumbers();
   }

   function clearSelectedNumbers () {
     listOfNumbers = [];
     var $numbersSelected = document.querySelectorAll('[class="number-option"]');
     $numbersSelected.forEach(number => {
       number.style.background = "#ADC0C4";
     })
   }

   function setSelectedGame(gameName){
     selectedGame = listGames[0].filter(game => game.type === gameName);
   }

   function addGameDescription() {
     var $gameDescription = getElement('[class="game-description"]');
     var $gameBetName = getElement('[class="game-bet-tex"]');
     $gameBetName.innerHTML = selectedGame[0].type;
     $gameDescription.innerHTML = selectedGame[0].description;
   }

   function createNumbersForGame() {
     $divNumberGame.innerHTML = ''
     for (var i = 1; i <=selectedGame[0].range ; i++) {
       var newButton = document.createElement('button');
       var newButtonText = document.createTextNode(formatNumberOfButtons(i));
       newButton.appendChild(newButtonText);

       newButton.setAttribute('class', 'number-option');
       newButton.setAttribute('value', formatNumberOfButtons(i));
       newButton.setAttribute('number-option-is-selected', 'false');

       $divNumberGame.appendChild(newButton);
     }
     var $allNumberButtons = document.querySelectorAll('[class="number-option"]');
     createEventForNumberButton($allNumberButtons);
   }

   function formatNumberOfButtons(number){
     var formated = number < 10 ? `0${number}` : number;
     return formated;
   }

   function generateRandomNumbers(numberMax) {
     return String(formatNumberOfButtons(Math.ceil(Math.random() * numberMax)));
   }

   function completeRandomNumers() {
     var range =  selectedGame[0].range;
     while (listOfNumbers.length < selectedGame[0]['max-number']) {
       var randomNumber = String(generateRandomNumbers(range));
       if(listOfNumbers.indexOf(randomNumber) === -1 ){
         var $numberButton = document.querySelector('[value="'+randomNumber+'"]');
         $numberButton.click();
       }
     }
   }

   function createEventForButtonOptions (){
     // EVENT TO CLEAR GAME BUTTON
     getElement('[class="game-options-clear"]')
       .addEventListener('click', () => {
         clearSelectedNumbers();
     })

     // EVENT TO ADD TO CART BUTTON
     getElement('[class="games-add-cart-button"]')
       .addEventListener('click', () => {
         addGameToCart();
     })

     // EVENT TO COMPLETE RANDOM GAME
     getElement('[class="game-options-complete"]')
       .addEventListener('click', () => {
        clearSelectedNumbers();
         completeRandomNumers();
       })
   }

   function addGameToCart(){
     if(cart.length === 0) {
       $cartList.innerHTML = '';
     }

     const newGame = {
       id: String(new Date().getTime()),
       gameType: selectedGame[0].type,
       price: selectedGame[0].price,
       numbers: listOfNumbers,
       color: selectedGame[0].color
     }
     if(newGame.numbers.length < selectedGame[0]['max-number']){ // REVER ESSE IF

      var content = document.createTextNode(`O jogo necessita de ${selectedGame[0]['max-number']} números`);
      $alert[0].appendChild(content);
      $alert[0].setAttribute('class', 'alert alert-warning alert-dismissible fade show');
      return;
     }

     cart.push(newGame);
     updateCartPriceField();
     createGameOnCart(newGame);
     resetDataButtons();
     initialGameSelect();
   }

   function currencyFormated(price) {
     return price.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});
   }

   function createGameOnCart(game) {

     var gameCartDiv = document.createElement('div');
     var gameCartInfosDiv = document.createElement('div');
     var gameCartInfoTypePrice = document.createElement('div');

     var gameCartNumbers = document.createElement('p');
     var gameCartType = document.createElement('h2');
     var gameCartPrice = document.createElement('span');

     var gameCartRemoveButton = document.createElement('button');
     var gameCartRemoveImg = document.createElement('img');

     gameCartRemoveImg.setAttribute('src', "assets\\imgs\\trash.svg");

     gameCartDiv.setAttribute('class', 'game-cart-div');
     gameCartInfosDiv.setAttribute('class', 'game-cart-info');

     gameCartInfoTypePrice.setAttribute('class', 'game-cart-info-type-price');

     gameCartNumbers.setAttribute('class', 'game-cart-numbers');
     gameCartType.setAttribute('class', 'game-cart-type');
     gameCartPrice.setAttribute('class', 'game-cart-price');

     gameCartRemoveButton.setAttribute('class', 'game-cart-remove-button');
     gameCartRemoveButton.setAttribute('game-id', game.id);
     gameCartRemoveButton.appendChild(gameCartRemoveImg);

     gameCartNumbers.textContent = game.numbers.join(', ');
     gameCartPrice.textContent = currencyFormated(game.price);
     gameCartType.textContent = game.gameType;
     gameCartType.style.color = game.color;

     gameCartInfoTypePrice.appendChild(gameCartType);
     gameCartInfoTypePrice.appendChild(gameCartPrice);

     gameCartInfosDiv.style.borderLeft = `3px ${game.color} solid`;
     gameCartInfosDiv.appendChild(gameCartNumbers);
     gameCartInfosDiv.appendChild(gameCartInfoTypePrice);

     gameCartDiv.appendChild(gameCartRemoveButton);
     gameCartDiv.appendChild(gameCartInfosDiv);

     addEventOfRemoveGameCart(gameCartRemoveButton);

     return $cartList.appendChild(gameCartDiv);
   }

   function priceOfCart(){
     var totalPrice = 0;
     cart.forEach(game => {
       totalPrice += Number(game.price);
     })
     return totalPrice;
   }

   function updateCartPriceField() {
     var $cartPriceField = getElement('[class="cart-total-price"]');
     $cartPriceField.innerHTML = currencyFormated(priceOfCart());
   }

   function addEventOfRemoveGameCart(button){
     button.addEventListener('click', () => {
       var gameId = button.getAttribute('game-id');
       cart = cart.filter(game => game.id !== gameId);
       listAllGamesCartAgain();
     })

   }

   function closeAlert(){
    var $close = document.getElementsByClassName("close");
    for (let i = 0; i < $close.length; i++) {
      $close[i].addEventListener('click', () => {
        for (let j = 0; j < $alert.length; j++) {
          $alert[j].setAttribute('class', 'alert alert-warning alert-dismissible fade');
        }
      });
    }
   }

   function listAllGamesCartAgain(){
     if(cart.length === 0){
      $cartList.innerHTML = 'Seu carrinho está vazio!'
       return updateCartPriceField()
     }
     $cartList.innerHTML = '';
     cart.forEach(game => {
       createGameOnCart(game);
     })
     updateCartPriceField();
   }

   getAllGames();
 })(window, document);
