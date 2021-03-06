import {elements} from './base'

export const getInput = ()=> elements.searchInput.value;

export const clearInput = ()=> {
    elements.searchInput.value = '';
};

export const clearResults = ()=> {
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id =>{
    const resultArr = document.querySelectorAll('.results__link');

    resultArr.forEach(el => el.classList.remove('results__link--active'));
    document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
};


/*  // 'Pasta with tomato and spinach'
acc: 0 / acc + cur.length = 5 / newTitle = ['Pasta']
acc: 5 / acc + cur.length = 9 / newTitle = ['Pasta', 'with']
acc: 9 / acc + cur.length = 15 / newTitle = ['Pasta', 'with', 'tomato']
acc: 15 / acc + cur.length = 18 / newTitle = ['Pasta', 'with', 'tomato']
acc: 18 / acc + cur.length = 24 / newTitle = ['Pasta', 'with', 'tomato']*/
export const limitRecipeTitle = (title, limit=17) => {
    const newTitle = [];

    if (title.length > limit) {
        title.split(' ').reduce((acc, cur) => {

            if (acc + cur.length <= limit){
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);
        return `${newTitle.join(' ')} ...`;
    }
    return title;
};
/* The split() method is used to split a string into an array of substrings, and returns the new array. 
Tip: If an empty string ("") is used as the separator, the string is split between each character.

join() method is an inbuilt function in JavaScript which is used to join the elements of an array into a string. 
The elements of the string will be separated by a specified separator and its default value is comma(, ).
 */

const renderRecipe = recipe=>{
    let html = `<li>
                    <a class="results__link" href="#${recipe.recipe_id}">
                        <figure class="results__fig">
                            <img src="${recipe.image_url}" alt="${recipe.title}">
                        </figure>
                        <div class="results__data">
                            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                            <p class="results__author">${recipe.publisher}</p>
                        </div>
                    </a>
                </li>`;
    elements.searchResList.insertAdjacentHTML('beforeend', html);
};

const makeButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
        <span>Page ${type==='prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type==='prev' ? 'left' : 'right'}"></use>
        </svg>
    </button>`; // data attribute.. daha sonra buttona event eklicegimiz zaman bu data isimize yaricak

const renderButtons = (page, numResults, resPerPage) => {
    const pages = Math.ceil(numResults / resPerPage);
    let button;
    if(page === 1 && pages > 1){                                                    //only button to next page
        
        button = makeButton(page, 'next');
    }else if(page < pages){                                                         //both button
        
        button = `${makeButton(page, 'prev')}
                  ${makeButton(page, 'next')}`;
    }else if(page === pages && pages > 1){                                          //only button to previous page
        
        button = makeButton(page, 'prev')
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page=1, resPerPage=10) => {
    const start = (page - 1) * resPerPage;
    const end = page * resPerPage;

    recipes.slice(start, end).forEach(renderRecipe);
    renderButtons(page, recipes.length, resPerPage);
};