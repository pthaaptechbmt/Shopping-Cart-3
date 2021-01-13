const products = [
  {
    id: 1,
    image: "https://source.unsplash.com/320x240/?cookie",
    title: "Cake 1",
    description: "description 1",
    price: 5,
    discount: 10,
  },
  {
    id: 2,
    image: "https://source.unsplash.com/320x241/?cookie",
    title: "Candy 2",
    description: "description 2",
    price: 6.7,
    discount: undefined,
  },
  {
    id: 3,
    image: "https://source.unsplash.com/320x242/?cookie",
    title: "Cake 2",
    description: "description 3",
    price: 4.3,
    discount: 15,
  },
  {
    id: 4,
    image: "https://source.unsplash.com/320x243/?cookie",
    title: "Cake 2",
    description: "description 3",
    price: 12,
    discount: undefined,
  },
];

const coupons = [
  {
    id: 1,
    title: "Happy New Year 2021",
    code: "HPNY2021",
    description: "description 3",
    discount: 10,
    public: true,
    expired: "2021-01-22T08:13:28.056Z",
  },
  {
    id: 2,
    title: "Merry Christmas",
    description: "description 3",
    code: "MC2020",
    discount: 5,
    public: true,
    expired: "2021-01-22T08:13:28.056Z",
  },
  {
    id: 3,
    title: "Loyal customers",
    description: "description 3",
    code: "LC2021",
    discount: 5,
    public: false,
    expired: "2021-01-22T08:13:28.056Z",
  },
];
const shippingMethod = document.querySelector(".cart__shipping-select");
const shippingHTML = document.querySelector(".cart__shipping span");
const totalHTML = document.querySelector(".cart__total span");
const subtotalHTML = document.querySelector(".cart__subtotal span");
const cartTotalItemsHTML = document.querySelector(".cart__header span");
const cartCoupon = document.querySelector(".cart__coupon");
const couponList = cartCoupon.querySelector(".cart__coupon-list");
const couponAddButton = cartCoupon.querySelector(".cart__coupon-apply");
const couponInputHTML = cartCoupon.querySelector(".cart__coupon-input");
const promoDiscountHTML = document.querySelector(".cart__promo span");

const cart = products.map(function (product) {
  return { ...product, quantity: 1 };
});

function saveItemsToLocalStorage(items) {
  localStorage.setItem("carts", JSON.stringify(items));
}
function getItemsFromLocalStorage(nameItems) {
  let items = localStorage.getItem(nameItems);
  return items ? JSON.parse(items) : [];
}

saveItemsToLocalStorage(cart);

function calculatePrice(price, discount) {
  if (discount) return (price * (100 - discount)) / 100;
  return price;
}

function displayCartContent(items) {
  cartTotalItemsHTML.textContent = `${displayTotalItems()} items`;

  const cartContentHTML = document.querySelector(".cart__content");
  if (Array.isArray(items) && items.length) {
    let html = items
      .map(function ({ id, image, title, description, price, discount, quantity }) {
        return `
    <div class="cart__item" data-id="${id}">
        <div class="cart__image">
          <img src="${image}" alt="${title}" />
        </div>

        <div class="cart__item-content">
          <h3 class="cart__item-title">${title}</h3>
          <p class="cart__item-description">$${calculatePrice(price, discount).toFixed(2)}</p>
          <button class="cart__item-remove">remove</button>
        </div>

        <div class="cart__item-control">
          <button class="cart__item-increase">-</button>
          <input type="text" class="cart__item-quantity" value="${quantity}" />
          <button class="cart__item-decrease">+</button>
        </div>

        <span class="cart__item-price">$${(calculatePrice(price, discount) * quantity).toFixed(2)}</span>
    </div>
        `;
      })
      .join("");
    cartContentHTML.innerHTML = html;
    displayDiscount();
    handleButtonsInCart();
    handleInputsInCart();
    displayCartFooter();
  } else {
    cartContentHTML.innerHTML = `
        <div class="cart__empty">
          <img src="./empty-cart.png" alt="cart empty" />
          <h4>Your Cart Is Empty :(</h4>
        </div>
    `;
    displayCartFooter();
    handleShippingMethod();
  }
}

function displayTotalItems() {
  let totalItem = 0;
  getItemsFromLocalStorage("carts").forEach(function (item) {
    totalItem++;
  });
  return totalItem;
}

function displayDiscount() {
  let carts = getItemsFromLocalStorage("carts");
  for (let i = 0; i < carts.length; i++) {
    if (carts[i].discount) {
      let item = document.querySelector(`.cart__item[data-id="${carts[i].id}"]`);

      let spanDiscount = document.createElement("span");
      spanDiscount.classList.add("cart__discount");
      spanDiscount.textContent = `-${carts[i].discount}%`;
      item.querySelector(".cart__image").appendChild(spanDiscount);

      let spanPrice = document.createElement("span");
      spanPrice.textContent = `$${carts[i].price.toFixed(2)}`;
      item.querySelector(".cart__item-description").appendChild(spanPrice);
    }
  }
}

function getSubtotal() {
  const priceInputsHTML = [...document.querySelectorAll(".cart__item-price")];

  let arrayPrice = priceInputsHTML.map((e) => {
    return parseFloat(e.textContent.slice(1, e.textContent.length - 1));
  });

  return arrayPrice.reduce(function (pre, curr) {
    return pre + curr;
  }, 0);
}

function displayCartFooter() {
  let subtotal = getSubtotal();
  let promoDiscount = handlePromoDiscount();
  let shippingCost = parseFloat(shippingMethod.value);
  if (subtotal > 0) {
    subtotalHTML.textContent = `$${subtotal.toFixed(2)}`;
    shippingHTML.textContent = `$${shippingCost.toFixed(2)}`;
    totalHTML.textContent = `$${(subtotal + shippingCost - promoDiscount).toFixed(2)}`;
    handleShippingMethod();
  } else {
    subtotalHTML.textContent = `$0.00`;
    totalHTML.textContent = `$0.00`;
    shippingHTML.textContent = `$0.00`;
  }
}

function handleShippingMethod() {
  let subtotal = getSubtotal();
  let promoDiscount = handlePromoDiscount();
  let shippingCost = parseFloat(shippingMethod.value);
  shippingMethod.addEventListener("change", function () {
    if (subtotal > 0) {
      shippingCost = parseFloat(shippingMethod.value);
      shippingHTML.textContent = `$${shippingCost.toFixed(2)}`;
      totalHTML.textContent = `$${(subtotal + shippingCost - promoDiscount).toFixed(2)}`;
    } else {
      subtotalHTML.textContent = `$0.00`;
      totalHTML.textContent = `$0.00`;
      shippingHTML.textContent = `$0.00`;
    }
  });
}

function handleInputsInCart() {
  const inputsHTML = [...document.querySelectorAll("input")];
  inputsHTML.forEach(function (inputHTML) {
    if (inputHTML.classList.contains("cart__item-quantity")) {
      inputHTML.addEventListener("blur", function (event) {
        let id = event.target.parentElement.parentElement.dataset.id;
        let valueInput = event.target.value;
        let patternDigit = /^[0-9]*$/gi;
        if (!patternDigit.test(valueInput) || valueInput < 1) {
          alert("Please choose at least one product!");
          event.target.value = 1;
          updatePrice(id, event.target.value);
        } else updatePrice(id, event.target.value);
      });
    }
  });
}

function handleButtonsInCart() {
  const buttonsHTML = [...document.querySelectorAll("button")];

  buttonsHTML.forEach(function (buttonHTML) {
    if (buttonHTML.classList.contains("cart__item-increase"))
      buttonHTML.addEventListener("click", function (event) {
        let id = event.target.parentElement.parentElement.dataset.id;
        let inputHTML = event.target.nextElementSibling;
        if (inputHTML.value < 2) return;
        let quantity = inputHTML.value--;
        updatePrice(id, quantity - 1);
      });
    if (buttonHTML.classList.contains("cart__item-decrease"))
      buttonHTML.addEventListener("click", function (event) {
        let id = event.target.parentElement.parentElement.dataset.id;
        let inputHTML = event.target.previousElementSibling;
        let quantity = inputHTML.value++;
        updatePrice(id, quantity + 1);
      });

    if (buttonHTML.classList.contains("cart__item-remove"))
      buttonHTML.addEventListener("click", function (event) {
        let id = event.target.parentElement.parentElement.dataset.id;
        removeProductInCart(id);
      });
  });
}

function updatePrice(id, quantity) {
  const item = document.querySelector(`.cart__item[data-id='${id}']`);
  const cartPrice = item.querySelector(".cart__item-price");
  let carts = getItemsFromLocalStorage("carts");
  let productIndex = carts.findIndex(function (product) {
    return product.id === parseInt(id);
  });
  carts[productIndex].quantity = quantity;
  saveItemsToLocalStorage(carts);
  cartPrice.textContent = `$${(
    calculatePrice(carts[productIndex].price, carts[productIndex].discount) * quantity
  ).toFixed(2)}`;
  displayCartFooter();
}

function removeProductInCart(id) {
  let carts = getItemsFromLocalStorage("carts");
  for (let i = 0; i < carts.length; i++) {
    if (carts[i].id === parseInt(id)) carts.splice(i, 1);
  }
  saveItemsToLocalStorage(carts);
  displayCartContent(carts);
}

const couponsAdded = [];

function getCouponCodeFromInput() {
  let couponCode = couponInputHTML.value;
  return couponCode.toUpperCase();
}

function handleCoupon() {
  couponAddButton.addEventListener("click", function () {
    handleAddCoupon(getCouponCodeFromInput());
  });
  couponInputHTML.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      handleAddCoupon(getCouponCodeFromInput());
    }
  });
}

function handleAddCoupon(couponCode) {
  let couponItem = coupons.filter(function ({ code }) {
    return couponCode === code;
  });
  if (couponItem[0]) {
    if (!couponsAdded.some((coupon) => coupon.id === couponItem[0].id)) {
      couponsAdded.push(couponItem[0]);
      let { id, title, code, discount } = couponItem[0];
      let couponItemHTML = document.createElement("li");
      couponItemHTML.setAttribute("data-id", `${id}`);
      couponItemHTML.classList.add("cart__coupon-item");
      couponItemHTML.innerHTML = `<span><strong>-${discount}%</strong>${title}(${code})</span><button class="cart__coupon-remove"><i class='bx bxs-minus-circle'></i></button>`;
      couponList.appendChild(couponItemHTML);
      handelRemoveCoupon();
      couponInputHTML.value = "";
      handlePromoDiscount();
      displayCartFooter();
    } else alert("Your Code has added!");
  } else alert("Your Code does not exist!");
}

function handelRemoveCoupon() {
  const [...couponRemoveButtons] = couponList.querySelectorAll(".cart__coupon-remove");
  couponRemoveButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      let couponItemHTML = event.target.parentElement.parentElement;

      for (let i = 0; i < couponsAdded.length; i++) {
        if (couponsAdded[i].id === parseInt(couponItemHTML.dataset.id)) couponsAdded.splice(i, 1);
      }

      if (couponItemHTML.parentNode) {
        couponItemHTML.parentNode.removeChild(couponItemHTML);
      }
      handlePromoDiscount();
      displayCartFooter();
    });
  });
}

function handlePromoDiscount() {
  let totalPercentage = couponsAdded.reduce(function (pre, curr) {
    return pre + curr.discount;
  }, 0);
  let promoDiscountValue = (getSubtotal() * totalPercentage) / 100;
  promoDiscountHTML.textContent = `-$${promoDiscountValue.toFixed(2)}`;
  return promoDiscountValue;
}

function displayPromoList() {
  const couponHelpHTML = document.querySelector(".cart__coupon-help");
  const couponListHTML = document.querySelector(".coupon__list");

  // Display promo code form coupons list
  let couponsPublic = coupons.filter(function (coupon) {
    return coupon.public === true;
  });
  let html = "";

  couponsPublic.forEach(function ({ id, code, title, description, discount, expired }) {
    html += `
      <div class="coupon__item">
        <span class="coupon__value">-${discount.toString().padStart(2, "0")}%</span>
        <div class="coupon__content">
          <div class="coupon__title"><span>${code}</span><br>${title}</div>
          <p class="coupon__description">${description}</p>
          <div class="coupon__expired">Expiration date: <strong>${getDate(expired)}</strong></div>
        </div>
        <button class="coupon__button">Use</button>
      </div>
    `;
  });
  couponListHTML.innerHTML = html;
  handlePromoList();
  const overlayHTML = document.querySelector(".cart--overlay");
  couponHelpHTML.addEventListener("click", function () {
    if (!couponListHTML.classList.contains("display--promo") && !overlayHTML.hasOwnProperty("style")) {
      overlayHTML.style.display = "block";
      couponListHTML.classList.add("display--promo");
    } else {
      couponListHTML.classList.remove("display--promo");
      overlayHTML.style.display = "none";
    }
  });

  overlayHTML.addEventListener("click", function () {
    if (couponListHTML.classList.contains("display--promo")) {
      couponListHTML.classList.remove("display--promo");
      overlayHTML.style.display = "none";
    }
  });
}

function handlePromoList() {
  const couponListHTML = document.querySelector(".coupon__list");
  const [...couponAddButtons] = couponListHTML.querySelectorAll(".coupon__button");
  couponAddButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      let couponContentHTML = event.target.previousElementSibling;
      let couponCode = couponContentHTML.querySelector(".coupon__title span").textContent;
      handleAddCoupon(couponCode);
    });
  });
}

function getDate(date) {
  var dateObject = new Date(date);
  return `${dateObject.getDate()}-${(dateObject.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${dateObject.getFullYear()}`;
}

displayCartContent(getItemsFromLocalStorage("carts"));
handleCoupon();
displayPromoList();
