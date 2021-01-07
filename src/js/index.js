import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import {elements, renderLoader, clearLoader} from './views/base';


const state = {};

const controlSearch = async ()=>{                                   // SEARCH CONTROLLER
    const query = searchView.getInput();                            //1 get query from view

    if(query){                                                      //2 new search object and add to state
        state.search = new Search(query);

        searchView.clearInput();                                    //3 preparing UI for the results
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            await state.search.getResults();                        //4 search for the recipes
            
            clearLoader(elements.searchRes);                        //5 render result on UI
            searchView.renderResults(state.search.result);  
        } catch (error) {
            alert('Something went wrong about the search ...');
            clearLoader(elements.searchRes);
        }     
    }
};

elements.searchForm.addEventListener('submit', e => {               //SEARCH BUTTON EVENT
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e =>{             //PAGE CLICK EVENT
    // const btn = e.target.classList.contains('btn-inline');   ===> event delegation
    const btn = e.target.closest('.btn-inline');
    //closest () returns the closest ancestor of the selected element. It may be null. Hovewer mathces() returns Boolean.
    if(btn){
        const goToPage = parseInt(btn.dataset.goto);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    };
});

const controlRecipe = async ()=>{                                   //RECIPE CONTROLLER
    const id = window.location.hash.replace('#', '');

    if(id){
        recipeView.clearRecipe();                                   //prepare UI 
        renderLoader(elements.recipe);  
        
        if (state.search) searchView.highlightSelected(id);         //higglight selected searct item
       
        state.recipe = new Recipe(id);                              //make new Recipe Object

        try {                                                       //get recipe data
            await state.recipe.getRecipe();                         //console.log(state.recipe.ingredients)  
            state.recipe.parseIngredients();                        //console.log(state.recipe.ingredients)

            state.recipe.calcTime();                                //calculate servings and time
            state.recipe.calcServings();

            clearLoader();                                          //render recipe
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        } catch (error) {
            alert('There is a mistake about the recipe')
        }
    }
};

//                                                                  //window.addEventListener('hashchange', controlRecipe);
//                                                                  //window.addEventListener('load', controlRecipe);
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

const controlList = ()=>{                                           //List Controller
    if (!state.list) state.list = new List();                       //make a new list

    state.recipe.ingredients.forEach(el => {                        //add each ingredient to the list and UI
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

elements.shoppingList.addEventListener('click',  e => {             //handle delete and update list items
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    if(e.target.matches('.shopping__delete, .shopping__delete *')){  //handle delete button
        state.list.deleteItem(id);

        listView.deleteItem(id);
    }else if (e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});  

const controlLike = ()=>{
    if(!state.likes) state.likes = new Likes;
    const currentID = state.recipe.id;

    if(!state.likes.isLiked(currentID)){                            //no likes yet
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        likesView.toggleLikeBtn(true);
        likesView.renderLike(newLike)
    }else{                                                          //liked already
        state.likes.deleteLike(currentID);
        
        likesView.toggleLikeBtn(false);
        likesView.deleteLike(currentID)
    };
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

window.addEventListener('load', ()=>{
    state.likes = new Likes();

    state.likes.readStorage();

    likesView.toggleLikeMenu(state.likes.getNumLikes());

    state.likes.likes.forEach(like => likesView.renderLike(like));
})

elements.recipe.addEventListener('click', e =>{                     //handling recipe button clicks

    if (e.target.matches('.btn-decrease, .btn-decrease *')){

        if(state.recipe.servings > 1){

        state.recipe.updateServings('dec')
        recipeView.updateServingsIngredients(state.recipe);
        };
    }else if(e.target.matches('.btn-increase, .btn-increase *')){

        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn-add, .recipe__btn-add *')){
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});

