<script src = "https://unpkn.com/vue"></script>

const app = new Vue({
    el: '#app',
    data:{
        products: [] //add items in here
    },
    computed:{
        totalProducts (){
            return this.products.reduce((sum, product) => {
                return sum + product.quantity// adding up each quant. of each product
            }, 0)
        }
    },
    created() { //or fetch data online:
        fetch('https://api.myjson.com/bins/74163')
        .then(response => response.json())
        .then(json => {
            this.products = json.products //print out the json string (not human readable)
        })
    }
})

/* 
<!-- testVue code for index.html -->
<div id ="app">
    <ul>
        <li v-for="product in products">
            <input type="number" v-model.number=.quantity>
            {{product.quantity}}{{product.name}} 
            <span v-if="product.quantity === 0">
                - OUT OF STOCK
            </span>
            <button @click="product.quantity +=1"> 
                Add One
            </button>
        </li>
    </ul>
    <h2>Total Inventory: {{totalProducts}}</h2>
</div>
*/
