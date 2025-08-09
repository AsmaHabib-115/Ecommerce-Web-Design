// product-listing.js
// Standalone product listing with filters, search, sort, pagination

/* -----------------------------
   Sample DATA - replace with your real product data later
   Each product: id, name, price, oldPrice, rating (1-5),
                 category, brand, features (array), condition, img, shortDesc
-------------------------------*/
const PRODUCTS = [
  { id:1, name:"Canon EOS 2000", price:998, oldPrice:1199, rating:5, category:"Mobile accessory", brand:"Canon", features:["USB","Waterproof"], condition:"new", img:"https://picsum.photos/seed/1/480/320", shortDesc:"Black 10x zoom" },
  { id:2, name:"GoPro HERO6 Action Camera", price:998, oldPrice:null, rating:4, category:"Mobile accessory", brand:"GoPro", features:["4K","Waterproof"], condition:"new", img:"https://picsum.photos/seed/2/480/320", shortDesc:"4K action camera" },
  { id:3, name:"iPhone 14 Pro", price:1299, oldPrice:1399, rating:5, category:"Smartphones", brand:"Apple", features:["5G","FaceID"], condition:"new", img:"https://picsum.photos/seed/3/480/320", shortDesc:"Latest Apple phone" },
  { id:4, name:"Samsung Galaxy S23", price:1099, oldPrice:null, rating:4, category:"Smartphones", brand:"Samsung", features:["5G","FastCharge"], condition:"new", img:"https://picsum.photos/seed/4/480/320", shortDesc:"Premium Android phone" },
  { id:5, name:"Huawei Mate 50", price:999, oldPrice:1099, rating:4, category:"Smartphones", brand:"Huawei", features:["5G"], condition:"refurb", img:"https://picsum.photos/seed/5/480/320", shortDesc:"Powerful camera phone" },
  { id:6, name:"Noise Cancelling Headphones", price:199, oldPrice:249, rating:4, category:"Headphones", brand:"Sony", features:["NoiseCancel"], condition:"new", img:"https://picsum.photos/seed/6/480/320", shortDesc:"Over-ear with mic" },
  { id:7, name:"Gaming Headset Pro", price:79, oldPrice:99, rating:3, category:"Headphones", brand:"HyperX", features:["Surround"], condition:"new", img:"https://picsum.photos/seed/7/480/320", shortDesc:"For gamers" },
  { id:8, name:"Wireless Earbuds", price:129, oldPrice:159, rating:4, category:"Headphones", brand:"Samsung", features:["Bluetooth"], condition:"new", img:"https://picsum.photos/seed/8/480/320", shortDesc:"In-ear wireless" },
  { id:9, name:"Laptop Pro 15\"", price:1499, oldPrice:1699, rating:5, category:"Computers", brand:"Dell", features:["SSD","16GB"], condition:"new", img:"https://picsum.photos/seed/9/480/320", shortDesc:"Power laptop" },
  { id:10, name:"4K Monitor 27\"", price:399, oldPrice:499, rating:5, category:"Computers", brand:"LG", features:["4K"], condition:"new", img:"https://picsum.photos/seed/10/480/320", shortDesc:"Crisp display" },
  { id:11, name:"USB-C Hub", price:39, oldPrice:null, rating:3, category:"Accessories", brand:"Anker", features:["USB-C"], condition:"new", img:"https://picsum.photos/seed/11/480/320", shortDesc:"Multiport hub" },
  { id:12, name:"Smart Bulb (pack)", price:29, oldPrice:49, rating:4, category:"Home", brand:"Philips", features:["Color"], condition:"new", img:"https://picsum.photos/seed/12/480/320", shortDesc:"Smart lighting" },
  { id:13, name:"Mechanical Keyboard", price:99, oldPrice:null, rating:4, category:"Accessories", brand:"Logitech", features:["RGB"], condition:"new", img:"https://picsum.photos/seed/13/480/320", shortDesc:"Tactile keys" },
  { id:14, name:"Smart Watch Series 6", price:299, oldPrice:null, rating:4, category:"Wearables", brand:"Apple", features:["HeartRate"], condition:"new", img:"https://picsum.photos/seed/14/480/320", shortDesc:"Health tracking" },
  { id:15, name:"Bluetooth Speaker X", price:49, oldPrice:69, rating:3, category:"Audio", brand:"JBL", features:["Waterproof"], condition:"new", img:"https://picsum.photos/seed/15/480/320", shortDesc:"Portable speaker" }
];

// State
let state = {
  search: '',
  categories: new Set(),
  brands: new Set(),
  features: new Set(),
  minPrice: null,
  maxPrice: null,
  condition: 'any',
  ratings: new Set(),
  sort: 'featured',
  page: 1,
  pageSize: 9
};

// Helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function unique(arr, key) { return Array.from(new Set(arr.map(x=>x[key]))).sort(); }

// Populate filter lists
function buildFilterLists(){
  const cats = unique(PRODUCTS, 'category');
  const brands = unique(PRODUCTS, 'brand');
  const features = Array.from(new Set(PRODUCTS.flatMap(p=>p.features))).sort();

  const catContainer = $('#categoryList');
  cats.forEach(c=>{
    const id = 'cat-'+c.replace(/\W+/g,'-');
    const el = document.createElement('label');
    el.innerHTML = `<input type="checkbox" class="cat-checkbox" value="${c}"> ${c}`;
    catContainer.appendChild(el);
  });

  const brandContainer = $('#brandList');
  brands.forEach(b=>{
    const el = document.createElement('label');
    el.innerHTML = `<input type="checkbox" class="brand-checkbox" value="${b}"> ${b}`;
    brandContainer.appendChild(el);
  });

  const featContainer = $('#featureList');
  features.forEach(f=>{
    const el = document.createElement('label');
    el.innerHTML = `<input type="checkbox" class="feat-checkbox" value="${f}"> ${f}`;
    featContainer.appendChild(el);
  });
}

// Filtering logic
function applyFilters(){
  let list = PRODUCTS.slice();

  // search
  if(state.search && state.search.trim()){
    const s = state.search.trim().toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(s) || p.shortDesc.toLowerCase().includes(s));
  }

  // categories
  if(state.categories.size>0){
    list = list.filter(p => state.categories.has(p.category));
  }

  // brands
  if(state.brands.size>0){
    list = list.filter(p => state.brands.has(p.brand));
  }

  // features
  if(state.features.size>0){
    list = list.filter(p => p.features.some(f => state.features.has(f)));
  }

  // ratings (if any, filter by min rating)
  if(state.ratings.size>0){
    const minRating = Math.min(...Array.from(state.ratings).map(Number));
    list = list.filter(p => p.rating >= minRating);
  }

  // condition
  if(state.condition && state.condition !== 'any'){
    list = list.filter(p => p.condition === state.condition);
  }

  // price
  if(Number.isFinite(state.minPrice)) list = list.filter(p => p.price >= state.minPrice);
  if(Number.isFinite(state.maxPrice)) list = list.filter(p => p.price <= state.maxPrice);

  // sort
  if(state.sort === 'price-asc') list.sort((a,b)=>a.price-b.price);
  else if(state.sort === 'price-desc') list.sort((a,b)=>b.price-a.price);
  else if(state.sort === 'rating-desc') list.sort((a,b)=>b.rating-a.rating);
  // else keep featured ordering

  return list;
}

// Render products with pagination
function render(){
  const all = applyFilters();
  const total = all.length;
  const pageSize = state.pageSize;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if(state.page > totalPages) state.page = totalPages;

  const start = (state.page-1)*pageSize;
  const pageItems = all.slice(start, start + pageSize);

  const grid = $('#productGrid');
  grid.innerHTML = '';
  if(pageItems.length===0){
    grid.innerHTML = `<div class="no-results">No products found for applied filters.</div>`;
  } else {
    pageItems.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="thumb"><img src="${p.img}" alt="${escapeHtml(p.name)}"></div>
        <div class="meta">
          <h4>${escapeHtml(p.name)}</h4>
          <div class="price-row"><div class="price">$${p.price.toLocaleString()}</div>${p.oldPrice?`<div class="old">$${p.oldPrice.toLocaleString()}</div>`:''}</div>
          <div class="rating">${'★'.repeat(p.rating)}${'☆'.repeat(5-p.rating)}</div>
          <div class="desc">${escapeHtml(p.shortDesc)}</div>
          <div class="actions">
            <button class="btn">View details</button>
            <button class="fav">♡</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  $('#resultCount').textContent = total;

  // pagination UI
  renderPagination(totalPages);
}

function renderPagination(totalPages){
  const nav = $('#pagination');
  nav.innerHTML = '';
  if(totalPages <= 1) return;
  const addBtn = (label, page, active=false) => {
    const b = document.createElement('button');
    b.className = 'page-btn' + (active? ' active':'');
    b.textContent = label;
    b.addEventListener('click', ()=>{ state.page = page; render(); window.scrollTo({top:200, behavior:'smooth'}); });
    return b;
  };
  if(state.page > 1) nav.appendChild(addBtn('Prev', state.page-1));
  // show up to 7 pages
  const maxShown = 7;
  let start = Math.max(1, state.page - Math.floor(maxShown/2));
  let end = Math.min(totalPages, start + maxShown -1);
  if(end - start < maxShown -1) start = Math.max(1, end - maxShown + 1);
  for(let i=start;i<=end;i++){
    nav.appendChild(addBtn(i, i, i===state.page));
  }
  if(state.page < totalPages) nav.appendChild(addBtn('Next', state.page+1));
}

// Utility
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]); }

/* ----------------------
   Wire events
------------------------*/
function wireEvents(){
  // global search (debounced)
  let timer = null;
  $('#globalSearch').addEventListener('input', (e)=>{
    clearTimeout(timer);
    timer = setTimeout(()=>{
      state.search = e.target.value;
      state.page = 1;
      render();
    }, 300);
  });

  // category checkboxes
  document.getElementById('categoryList').addEventListener('change', (e)=>{
    if(e.target.matches('.cat-checkbox')){
      const v = e.target.value;
      if(e.target.checked) state.categories.add(v);
      else state.categories.delete(v);
      state.page = 1;
      render();
    }
  });

  // brand checkboxes
  document.getElementById('brandList').addEventListener('change', (e)=>{
    if(e.target.matches('.brand-checkbox')){
      const v = e.target.value;
      if(e.target.checked) state.brands.add(v);
      else state.brands.delete(v);
      state.page = 1;
      render();
    }
  });

  // feature checkboxes
  document.getElementById('featureList').addEventListener('change', (e)=>{
    if(e.target.matches('.feat-checkbox')){
      const v = e.target.value;
      if(e.target.checked) state.features.add(v);
      else state.features.delete(v);
      state.page = 1;
      render();
    }
  });

  // rating checkboxes
  $$('.rating-checkbox').forEach(cb=>{
    cb.addEventListener('change', ()=>{
      state.ratings = new Set($$('.rating-checkbox:checked').map(x=>x.value));
      state.page = 1;
      render();
    });
  });

  // condition radios
  $$("input[name='condition']").forEach(r=>{
    r.addEventListener('change', (e)=>{
      state.condition = e.target.value;
      state.page = 1;
      render();
    });
  });

  // price apply/clear
  $('#applyPrice').addEventListener('click', ()=>{
    const min = parseFloat($('#minPrice').value);
    const max = parseFloat($('#maxPrice').value);
    state.minPrice = Number.isFinite(min) ? min : null;
    state.maxPrice = Number.isFinite(max) ? max : null;
    state.page = 1;
    render();
  });
  $('#clearPrice').addEventListener('click', ()=>{
    $('#minPrice').value = ''; $('#maxPrice').value = '';
    state.minPrice = null; state.maxPrice = null;
    state.page = 1;
    render();
  });

  // sort
  $('#sortSelect').addEventListener('change', (e)=>{
    state.sort = e.target.value;
    state.page = 1;
    render();
  });

  // page size
  $('#pageSizeSelect').addEventListener('change', (e)=>{
    state.pageSize = parseInt(e.target.value,10) || 9;
    state.page = 1;
    render();
  });

  // clear all
  $('#clearAll').addEventListener('click', ()=>{
    // reset inputs
    $('#globalSearch').value=''; state.search='';
    $$('.cat-checkbox').forEach(cb=>cb.checked=false); state.categories.clear();
    $$('.brand-checkbox').forEach(cb=>cb.checked=false); state.brands.clear();
    $$('.feat-checkbox').forEach(cb=>cb.checked=false); state.features.clear();
    $$('.rating-checkbox').forEach(cb=>cb.checked=false); state.ratings.clear();
    $("input[name='condition'][value='any']").checked = true; state.condition='any';
    $('#minPrice').value=''; $('#maxPrice').value=''; state.minPrice=null; state.maxPrice=null;
    $('#sortSelect').value='featured'; state.sort='featured';
    state.page=1; state.pageSize=9;
    $('#pageSizeSelect').value='9';
    render();
  });

  // clear single category/brand link handlers
  $('#clearCategory').addEventListener('click',(e)=>{ e.preventDefault(); $$('.cat-checkbox').forEach(cb=>cb.checked=false); state.categories.clear(); render(); });
  $('#clearBrand').addEventListener('click',(e)=>{ e.preventDefault(); $$('.brand-checkbox').forEach(cb=>cb.checked=false); state.brands.clear(); render(); });

  // wire dynamic checkboxes after populate
}

// Initialize
function init(){
  buildFilterLists();
  // must wire events after checkboxes exist
  wireEvents();
  render();
}

// Run
document.addEventListener('DOMContentLoaded', init);
