// Global vars
var mainEl = $("main");
var liquorSearchEl = $("#liquor-search");
var proteinSearchEl = $("#protein-search");
var circleIndicatorOneEl = $("#circle-indicator-1");
var circleIndicatorTwoEl = $("#circle-indicator-2");
// Array for meal suggestions
var meals = [];
// Array for drink suggestions
var drinks = [];
/*
-----------------------    SCROLL HANDLING SECTION    ----------------------
*/
// disable scrolling
var disableScroll = function() {
    mainEl.css("overflow-y","hidden");
}
// enable scrolling
var enableScroll = function() {
    mainEl.css("overflow-y","scroll");
}

/*
-----------------------    SUBMIT HANDLER FOR SEARCHING INGREDIENTS FORM    ----------------------
*/
var submitHandler = function(event) {
    // prevent from refreshing page
    event.preventDefault()

    // switch to second input field if on first one
    if(circleIndicatorOneEl.hasClass("active") ) {
        // check if user added protein and liquor before sending data
        if(!proteinSearchEl.val() || !meals.includes(proteinSearchEl.val())) {
            $(proteinSearchEl)
                .val("")
                .attr("placeholder", "Invalid ingredient, try again");
            return;
        } else {
            // fetch food function here
            fetchMealSearch(proteinSearchEl.val());

            // removing visibility from first input and circle indicator
            proteinSearchEl.removeClass("active");
            circleIndicatorOneEl.removeClass("active");

            // adding visibility to second input and circle indicator and focus on input
            liquorSearchEl.addClass("active");
            circleIndicatorTwoEl.addClass("active");
            liquorSearchEl.focus();
        }

    } else { // user is on second field(liquor input)
        if(!liquorSearchEl.val() || !drinks.includes(liquorSearchEl.val()) ) { // if not valid or just empty spaces
            $(liquorSearchEl)
                .val("")
                .attr("placeholder", "Invalid ingredient, try again");
            return;
        } else {
            fetchLiquorSearch(liquorSearchEl.val());
            // scroll to results section after search
            mainEl[0].scrollTo(0, $('#results-section').offset().top);
            enableScroll();
        }
    }
}

/*
-----------------------    MEAL-API SECTION    ----------------------
*/
//Element vars
var mealResultsEl = $("#meal-results");
var mealsSavedEl = $("#meals-saved");
//recipe book data
var mealRecipeBookData = [];
//shopping list data
var mealShoppingData = [];

// push data from api to food array for suggestion
var suggestMeal = function(data) {
    data.meals.forEach(element => {
        meals.push(element.strIngredient);
    });
}
//ADD FETCHED MEALS TO RESULTS SECTION
var mealResults = function(data) {
        data.meals.forEach(element => {
        //wrapper for ind. meals
        var singleMealDiv = document.createElement("div");
        //bg img
        var mealImg = document.createElement("img");
        //wrapper for title
        var mealHeader = document.createElement("div");
        // title
        var mealTitle = document.createElement("h6");

        // add classes needed to elements
        $(singleMealDiv).addClass("cell large-4 medium-4 small-6 result-cell");
        $(mealHeader).addClass("result-bg");
        $(mealTitle).addClass("result");
        // add data-img of meal
        $(mealImg).attr("src", element.strMealThumb);
        // add text data-title of meal
        $(mealTitle).text(element.strMeal);
        // set meal id to cell id
        $(singleMealDiv).attr("id", element.idMeal);
        // put h4 in h4 wrapper
        mealHeader.append(mealTitle);
        // put h4 and img in cell
        singleMealDiv.append(mealImg, mealHeader);
        // append cell to results element
        mealResultsEl.append(singleMealDiv);
    });
}
// MEAL MODAL
var openMealModal = function(data) {
    var dataInfo = data.meals[0];
    var mealId = dataInfo.idMeal;
    var mealName = dataInfo.strMeal;
    var instructions = dataInfo.strInstructions;
    var img = dataInfo.strMealThumb;
    var ingredients = [];
    var saveText = "";

    // Filtering through the objects to find ingredients and put their values in an array
    for(var i = 0; i < 15; i++) { // ingredients list goes to 15 max in api
        if(dataInfo["strIngredient"+i]){
            ingredients.push(" " + dataInfo["strIngredient"+i]);
        };
    }
    // Find if the array already has recipe as object by comparing the property value then
    // if in recipe book, update to text to "remove from recipe book" else to "save to recipe"
    if(mealRecipeBookData.some(recipe => recipe.mealName === mealName)){
        saveText = "Remove From Recipe Book";
    } else {
        saveText = "Save To Recipe Book";
    }
    // update text and add meal id date in save btn
    $("#meal-save-btn")
        .text(saveText)
        .attr('data-mealId', mealId);
    // update meal name in modal
    $("#meal-name").text(mealName);
    // update meal details: add category, alchohol, glass, instructions, ingredients
    $("#meal-highlight-details").html(
        "<p>Instructions: "+ instructions + "</p>" +
        "<br>" +
        "<p id='meal-ingredients'>Ingredients: "+ ingredients + "</p>"
    );
    //update img
    $("#meal-highlight-img").html("<img src='" +img+"'/>");
    //open food modal
    var modal = new Foundation.Reveal($('#meal-modal'));
    modal.open();
}

// fetch list of ingrediants to add to suggestion (CALLS SUGGEST MEAL)
var fetchMealIngredientList = function() {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
    .then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                suggestMeal(data); // populate suggestions
            });
        } else {
            console.log("not feeling it...");
        }
    });
}
// FETCH INGREDIENT SEARCHED (CALLS MEAL RESULTS)
var fetchMealSearch = function(keyword) {
    fetch("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    mealResults(data);
                });
            } else {
                console.log("not feeling it...");
            }
        });
}
// fetch clicked meal from results (CALLS OPEN MODAL)
var fetchMealInfo = function(idMeal) {
    // search by id
    fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + idMeal)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    openMealModal(data);
                });
            } else {
                console.log("no good baby");
            }
        });
}
// MEAL SELECTED FROM RESULTS (CALLS FETCH MEAL INFO)
var mealClicked = function(event) {
    // find meals container
   var meal = $(event.target).closest(".result-cell");
   // get id (unique meal id needed for api search)
   var idMeal = $(meal).attr("id");

   fetchMealInfo(idMeal);
}

// ADD MEALS TO RECIPE BOOK
var populateMealRecipeBook = function(name, image, id, addRecipe) {
    // if adding to recipe book
    if(addRecipe === true) {
        // cell wrapper for individual drinks
        var cellDiv = document.createElement("div");
        // bg img in wrapper
        var img = document.createElement("img");
        // div wrapper for title/drink name
        var h6Div = document.createElement("div");
        // title/ drink name
        var h6 = document.createElement("h6");

        // add classes needed to elements
        $(cellDiv).addClass("cell large-4 medium-4 small-6 result-cell");
        $(h6Div).addClass("result-bg");
        $(h6).addClass("result");

        // add data-img
        $(img).attr("src", image);
        // add text data-title of drink
        $(h6).text(name);
        // set drink id to cell id
        $(cellDiv).attr("id", id);

        // put h4 in h4 wrapper
        h6Div.append(h6);
        // put h4 and img in cell
        cellDiv.append(img, h6Div);
        // append cell to results element
        $("#meals-saved").append(cellDiv);
    }
    // else if removing from recipe book
    else {
        // remove from saved recipe book section only
        $(mealsSavedEl).find("#"+id).remove();
    }
}
// ADD LAST MEAL UPDATED TO SHOPPING LIST
var populateMealShoppingList = function(name, ingredients, image) {
    // add text data-title of meal
    $("#meal-name-shopping").text("Ingredients: " + name);
    // make ul empty then fill with list elements
    $("#meal-ul-shopping").html("");
    // create list eleements
    ingredients.forEach(element => {
        var ingredient = document.createElement("li");
        $(ingredient).text(element);
        // put list items in UL
        $("#meal-ul-shopping").append(ingredient);
    });
    // add data-img
    $("#meal-shopping-img").attr("src", image);
}

// save OR remove recipe
var saveMealRecipe = function(event) {
    // grab meal name
    var name = $(event.target).closest("#meal-modal").find("#meal-name").text();
    // grab image
    var image = $(event.target).closest("#meal-modal").find("img").attr('src');
    // grab meal unique id
    var id = $(event.target).attr("data-mealId");
    // add or remove var
    var addRecipe = true;

    // save to recipe book / local storage
    var recipeData = {mealName: name, mealImg: image, mealId: id};

    // Find if the array already has recipe as object by comparing the property value
    if(mealRecipeBookData.some(recipe => recipe.mealName === name)){
        // delete if already saved (clicked "remove from recipe book)") by
        // updating recipe book var to not include this recipe
        mealRecipeBookData = mealRecipeBookData.filter(recipe => recipe.mealName !== name);
        // update local storage to array
        localStorage.setItem('mealRecipeBookData', JSON.stringify(mealRecipeBookData));
        // remove from recipe book
        addRecipe = false;
        // update text of modal
        $("#meal-save-btn").text("Save To Recipe Book");

    } else {
        // not a duplicate so save (clicked "save to recipe book")
        mealRecipeBookData.push(recipeData);
        // update local storage to array
        localStorage.setItem('mealRecipeBookData', JSON.stringify(mealRecipeBookData));
        // add to recipe book
        addRecipe = true;
        // update text of modal
        $("#meal-save-btn").text("Remove From Recipe Book");

    }

    // populate to recipe book right away
    populateMealRecipeBook(name, image, id, addRecipe);

}
// SAVE MEAL TO SHOPPING LIST (CALLS POPULATE MEAL FUNCTION)
var saveMealShopList = function(event) {
    // grab meal name
    var name = $(event.target).closest("#meal-modal").find("#meal-name").text();
    // grab ingredients
    var ingredientsText = $(event.target).closest("#meal-modal").find("#meal-ingredients").text();
    // grab image
    var image = $(event.target).closest("#meal-modal").find("img").attr('src');
    // remove the ingredients text from string
    ingredientsText = ingredientsText.split(':').pop();
    // turn into array by separating from comma
    var ingredients = ingredientsText.split(',');
    // update shopping data
    var shoppingData = {mealName: name, mealIngredients: ingredients, mealImg: image};
    mealShoppingData.push(shoppingData);
    // update local storage to array
    localStorage.setItem('mealShoppingData', JSON.stringify(mealShoppingData));
    // update text of modal
    $("#meal-save-shop-list").text("Update Shopping List");
    // populate to shopping list right away
    populateMealShoppingList(name, ingredients, image);
}

// load meal local storage data (CALLS POPULATE MEAL RECIPE BOOK)
var loadMealRecipeBook = function() {
    var localData = JSON.parse(localStorage.getItem("mealRecipeBookData"));
    // check if empty before loading
    if (localData) {
        // update array to local storage
        mealRecipeBookData = localData;
        // populate recipe book section with saved data
        mealRecipeBookData.forEach(element => {
            populateMealRecipeBook(element.mealName, element.mealImg, element.mealId, true);
        });
    } else {
        return
    }
}
// LOAD MEAL SHOPPING LIST (CALLS POPULATE MEAL SHOPPING LIST)
var loadMealShoppingList = function() {
    var localData = JSON.parse(localStorage.getItem("mealShoppingData"));
    // check if empty before loading
    if (localData) {
        // update array to local storage
        mealShoppingData = localData;
        // populate recipe book section with saved data
        populateMealShoppingList(mealShoppingData[0].mealName, mealShoppingData[0].mealIngredients, mealShoppingData[0].mealImg);
    } else {
        return
    }
}
/*
-----------------------    DRINK-API SECTION    ----------------------
*/
//Element vars
var drinkResultsEl = $("#drink-results");
var drinksSavedEl = $("#drinks-saved");
//recipe book save data
var drinkRecipeBookData = [];
// shopping list save data
var drinkShoppingData = [];

// push data from api to drinks array
var suggestLiquor = function(data) {
    data.drinks.forEach(element => {
        drinks.push(element.strIngredient1);
    });
}
// show drink results for liquor searched
var drinkResults = function(data) {
    data.drinks.forEach(element => {
        // cell wrapper for individual drinks
        var cellDiv = document.createElement("div");
        // bg img in wrapper
        var img = document.createElement("img");
        // div wrapper for title/drink name
        var h6Div = document.createElement("div");
        // title/ drink name
        var h6 = document.createElement("h6");

        // add classes needed to elements
        $(cellDiv).addClass("cell large-4 medium-4 small-6 result-cell");
        $(h6Div).addClass("result-bg");
        $(h6).addClass("result");

        // add data-img
        $(img).attr("src", element.strDrinkThumb);
        // add text data-title of drink
        $(h6).text(element.strDrink);
        // set drink id to cell id
        $(cellDiv).attr("id", element.idDrink);


        // put h4 in h4 wrapper
        h6Div.append(h6);
        // put h4 and img in cell
        cellDiv.append(img, h6Div);
        // append cell to results element
        drinkResultsEl.append(cellDiv)
    });
}
// DRINK MODAL
var openDrinkModal = function(data) {
    var dataInfo = data.drinks[0];
    var drinkId = dataInfo.idDrink;
    var drinkName = dataInfo.strDrink;
    var category = dataInfo.strCategory;
    var alcohol = dataInfo.strAlcoholic;
    var glass = dataInfo.strGlass;
    var instructions = dataInfo.strInstructions;
    var img = dataInfo.strDrinkThumb;
    var ingredients = [];
    var saveText = "";
    // Filtering through the objects to find list of ingredients and put their values in an array
    for(var i = 0; i < 15; i++) { // ingredients list goes to 15 max in api
        if(dataInfo["strIngredient"+i]){
            ingredients.push(" " + dataInfo["strIngredient"+i]); //added (" " + ) to add spaces after ingredient item
        };
    }
    // Find if the array already has recipe as object by comparing the property value then
    // if in recipe book, update to text to "remove from recipe book" else to "save to recipe"
    if(drinkRecipeBookData.some(recipe => recipe.drinkName === drinkName)){
        saveText = "Remove From Recipe Book";
    } else {
        saveText = "Save To Recipe Book";
    }
    // update text and add drink id date in save btn
    $("#save-btn")
        .text(saveText)
        .attr('data-drinkId', drinkId);
    // update drink name in modal
    $("#drink-name").text(drinkName);
    // update drink details: add category, alchohol, glass, instructions, ingredients
    $("#drink-highlight-details").html(
        "<p>Category: "+ category + "</p>" +
        "<br>" +
        "<p>Alcohol: "+ alcohol + "</p>" +
        "<br>" +
        "<p>Glass: "+ glass + "</p>" +
        "<br>" +
        "<p>Instructions: "+ instructions + "</p>" +
        "<br>" +
        "<p id='drink-ingredients'>Ingredients: "+ ingredients + "</p>"
    );
    // update img
    $("#drink-highlight-img").html("<img src='"+img+"'/>");
    // open this drink modal
    var modal = new Foundation.Reveal($('#drink-modal'));
    modal.open();
}

// FETCHING LIST OF INGREDIENTS (CALLS SUGGEST LIQUOR)
var fetchLiquorIngredientList = function() {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list")
    .then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                suggestLiquor(data); // populate suggestions
            });
        } else {
            console.log("no good baby");
        }
    });
}
// fetch the drinks for the liquor that the user searched (CALLS DRINK RESULTS)
var fetchLiquorSearch = function(keyword) {
    fetch("https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=" + keyword)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    // run drink results for searched liquor; function
                    drinkResults(data);
                });
            } else {
                console.log("no good baby");
            }
        });
}
// fetch clicked drink from results
var fetchDrinkInfo = function(idDrink) {
    // search by id
    fetch("https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=" + idDrink)
        .then(function(response) {
            if(response.ok) {
                response.json().then(function(data) {
                    openDrinkModal(data);
                });
            } else {
                console.log("no good baby");
            }
        });
}
// DRINK SELECTED FROM RESULTS/RECIPE BOOK
var drinkClicked = function(event) {
    // find drinks container
    var drink = $(event.target).closest(".result-cell");
    // get id (unique drink id needed for api search)
    var idDrink = $(drink).attr("id");

    // fetch drink clicked
    fetchDrinkInfo(idDrink);
}

// ADD LAST DRINK UPDATED TO SHOPPING LIST
var populateDrinkShoppingList = function(name, ingredients, image) {
    // add text data-title of drink
    $("#drink-name-shopping").text("Ingredients for the drink: " + name);
    // make ul empty then fill with list elements
    $("#drink-ul-shopping").html("");
    // create list eleements
    ingredients.forEach(element => {
        var ingredient = document.createElement("li");
        $(ingredient).text(element);
        // put list items in UL
        $("#drink-ul-shopping").append(ingredient);
    });
    // add data-img
    $("#drink-shopping-img").attr("src", image);
}
// SAVE DRINK TO SHOPPING LIST (CALLS POPULATE DRINK FUNCTION)
var saveDrinkShopList = function(event) {
    // grab drink name
    var name = $(event.target).closest("#drink-modal").find("#drink-name").text();
    // grab ingredients
    var ingredientsText = $(event.target).closest("#drink-modal").find("#drink-ingredients").text();
    // grab image
    var image = $(event.target).closest("#drink-modal").find("img").attr('src');
    // remove the ingredients text from string
    ingredientsText = ingredientsText.split(':').pop();
    // turn into array by seperating from comma
    var ingredients = ingredientsText.split(',');
    // update shopping data
    var shoppingData = {drinkName: name, drinkIngredients: ingredients, drinkImg: image};
    drinkShoppingData.push(shoppingData);
    // update local storage to array
    localStorage.setItem('drinkShoppingData', JSON.stringify(drinkShoppingData));
    // update text of modal
    $("#drink-save-shop-list").text("Update Shopping List");
    // populate to shopping list right away
    populateDrinkShoppingList(name, ingredients, image);
}
// LOAD LAST UPDATED DRINK TO SHOPPING LIST (CALLS POPULATE DRINK SHOPPING LIST)
var loadDrinkShoppingList = function() {
    var localData = JSON.parse(localStorage.getItem("drinkShoppingData"));
    // check if empty before loading
    if (localData) {
        // update array to local storage
        drinkShoppingData = localData;
        // populate recipe book section with saved data
        populateDrinkShoppingList(drinkShoppingData[0].drinkName, drinkShoppingData[0].drinkIngredients, drinkShoppingData[0].drinkImg);
    } else {
        return
    }
}

// POPULATE DRINK RECIPE BOOK
var populateDrinkRecipeBook = function(name, image, id, addRecipe) {
    // if adding to recipe book
    if(addRecipe === true) {
        // cell wrapper for individual drinks
        var cellDiv = document.createElement("div");
        // bg img in wrapper
        var img = document.createElement("img");
        // div wrapper for title/drink name
        var h6Div = document.createElement("div");
        // title/ drink name
        var h6 = document.createElement("h6");

        // add classes needed to elements
        $(cellDiv).addClass("cell large-4 medium-4 small-6 result-cell");
        $(h6Div).addClass("result-bg");
        $(h6).addClass("result");

        // add data-img
        $(img).attr("src", image);
        // add text data-title of drink
        $(h6).text(name);
        // set drink id to cell id
        $(cellDiv).attr("id", id);

        // put h4 in h4 wrapper
        h6Div.append(h6);
        // put h4 and img in cell
        cellDiv.append(img, h6Div);
        // append cell to results element
        $("#drinks-saved").append(cellDiv);
    }
    // else if removing from recipe book
    else {
        // remove from saved recipe book section only
        $(drinksSavedEl).find("#"+id).remove();
    }
}
// save & remove recipe function (CALLS POPULATE RECIPE BOOK)
var saveDrinkRecipe = function(event) {
    // grab drink name
    var name = $(event.target).closest("#drink-modal").find("#drink-name").text();
    // grab image
    var image = $(event.target).closest("#drink-modal").find("img").attr('src');
    // grab drink unique id
    var id = $(event.target).attr("data-drinkId");
    // add or remove var
    var addRecipe = true;

    // save to recipe book / local storage
    var recipeData = {drinkName: name, drinkImg: image, drinkId: id};

    // Find if the array already has recipe as object by comparing the property value
    if(drinkRecipeBookData.some(recipe => recipe.drinkName === name)){
        // delete if already saved (clicked "remove from recipe book)") by
        // updating recipe book var to not include this recipe
        drinkRecipeBookData = drinkRecipeBookData.filter(recipe => recipe.drinkName !== name);
        // update local storage to array
        localStorage.setItem('drinkRecipeBookData', JSON.stringify(drinkRecipeBookData));
        // remove from recipe book
        addRecipe = false;
        // update text of modal
        $("#save-btn").text("Save To Recipe Book");

    } else {
        // not a duplicate so save (clicked "save to recipe book")
        drinkRecipeBookData.push(recipeData);
        // update local storage to array
        localStorage.setItem('drinkRecipeBookData', JSON.stringify(drinkRecipeBookData));
        // add to recipe book
        addRecipe = true;
        // update text of modal
        $("#save-btn").text("Remove From Recipe Book");

    }

    // populate to recipe book right away
    populateDrinkRecipeBook(name, image, id, addRecipe);

}
// load drink local storage data (CALLS POPULATE DRINK RECIPE)
var loadDrinkRecipeBook = function() {
    var localData = JSON.parse(localStorage.getItem("drinkRecipeBookData"));
    // check if empty before loading
    if (localData) {
        // update array to local storage
        drinkRecipeBookData = localData;
        // populate recipe book section with saved data
        drinkRecipeBookData.forEach(element => {
            populateDrinkRecipeBook(element.drinkName, element.drinkImg, element.drinkId, true);
        });
    } else {
        return
    }
}
/*
-----------------------    LISTENERS, AUTO-COMPLETE, AND LOADS    ----------------------
*/
// populate meal & drink section of recipe book when page loads
loadMealRecipeBook();
loadDrinkRecipeBook();
// populate shopping list for meal & drink when page loads
loadMealShoppingList();
loadDrinkShoppingList();
// fetch ingredient list for auto complete
fetchMealIngredientList();
fetchLiquorIngredientList();
// auto complete meal search
proteinSearchEl.autocomplete({
    source: meals,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});
// auto complete liquor search
liquorSearchEl.autocomplete({
    source: drinks,
    appendTo: "#suggestions-wrapper",
    autoFocus: true
});
// submit listener
$("#search-form").on("submit", submitHandler);
// MEAL AND DRINK SELECTED
$(mealResultsEl).on("click", mealClicked);
$(drinkResultsEl).on("click", drinkClicked);
//MEAL AND DRINK SAVED
$(mealsSavedEl).on("click", mealClicked);
$(drinksSavedEl).on("click", drinkClicked);
// save to recipe
$("#meal-save-btn").on("click", saveMealRecipe);
$("#save-btn").on("click", saveDrinkRecipe);
//save to shopping list
$("#meal-save-shop-list").on("click", saveMealShopList);
$("#drink-save-shop-list").on("click", saveDrinkShopList);
