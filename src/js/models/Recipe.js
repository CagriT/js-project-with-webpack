import axios from 'axios';

export default class Recipe {
    constructor(id){
        this.id = id;
    }
    async getRecipe(){
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (error) {
            alert('Something went wrong:(');
        }
    }
    calcTime(){                                                                 //assuming 15 min for every 3 ingredient
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }
    calcServings(){
        this.servings = 4;
    }
    parseIngredients(){
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons','teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp','tbsp','oz','oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g']

        const newIngredients = this.ingredients.map(el => {
            let ingredient = el.toLowerCase();                                  //uniform units (make 2 arrays, one is with the real data, new one is how we want)

            unitsLong.forEach((item, i) =>{
                ingredient = ingredient.replace(item, unitsShort[i]);
            });

            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');              //remove parentheses ===> IMPORTANT Regular Expressions

            const arrIng = ingredient.split(' ');                                //parse ingredients into count, unit and ingredient  //IMPORTANT ===>
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2)); // burda normalde indexOf() da kullanilabilir di, ancak
            // neyi aradigimizi bilmiyoruz.. dolayisiyla includes true döndürürse o true nin indexini findIndex() ile alabiliriz
            
            let objIng;
            if(unitIndex > -1){                                                   //there is a unit
                const arrCount = arrIng.slice(0, unitIndex);
                let count;

                if(arrCount.length === 1){
                    count = eval(arrIng[0].replace('-', '+'));
                }else{
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex+1).join(' ')
                }
            }else if(parseInt(arrIng[0])){                                        //no unit but 1. element is a number
                objIng = {
                    count: parseInt(arrIng[0]),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' '),
                };
            }else if(unitIndex === -1){                                           //there is no unit
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }
            return objIng;
        });
        this.ingredients = newIngredients;
    }
    updateServings (type) {
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        this.ingredients.forEach(ing =>{
            ing.count *= newServings / this.servings;
        });

        this.servings = newServings;
    }
}