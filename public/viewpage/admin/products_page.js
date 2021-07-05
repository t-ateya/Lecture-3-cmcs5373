// @ts-nocheck
import * as Element from "../element.js";
import * as Constant from "../../model/constant.js";
import * as Util from "../util.js";
import * as Auth from "../../controller/auth.js";
import * as ProductsController from "../../controller/admin/products_controller.js";
import {
    Product
} from "../../model/Product.js";

let imageFile2Upload;


export async function products_page() {
    if (!Auth.currentUser) {
        return;
    }
    console.log('Current user: ', Auth.currentUser.email);
    // new product and filter product list form
    let html = `
        <div class="d-flex justify-content-between align-items-center">
            <button id="button-add-product" class="btn btn-outline-success mb-3">+ Add Product</button>
			<form class="form form-inline" id="filter-product-form" method="GET">
				<div div class = "input-group mb-3">
					<select class="form-select form-select-sm" name="order" aria-label="Select sorting order">
						<option value="1">Ascending order</option>
						<option value="0">Descending order</option>
					</select>
					<select class="form-select form-select-sm" name="filterBy" aria-label="filter products form">
						<option value="id" selected>id</option>
						<option value="name">product name</option>
						<option value="price">price</option>
					</select>

					<button class="btn btn-primary" type="submit">filter</button>
				</div>
			</form>
		</div>
		
		<table class="table">
			<thead>
				<tr>
					<th>#</th>
					<th></th>
					<th>Product</th>
					<th>Description</th>
					<th>Price</th>
					<th>Options</th>
				</tr>
			</thead>
			<tbody id="product-table-body">
    `;

    let products;
    try {
        products = await ProductsController.getProductList();
    } catch (e) {
        if (Constant.DeV) console.log(e);
        Util.info("Cannot get product list", JSON.stringify(e));
        return;
    }

    //render products
    products.forEach((p, index) => {
        html += buildProductCard(p, index);
    });

    html += `</tbody></table>`;

    Element.root.innerHTML = html;



    document
        .getElementById("button-add-product")
        .addEventListener("click", () => {
            Element.formAddProduct.form.reset();
            Element.formAddProduct.imageTag.src = "";
            imageFile2Upload = null;
            Element.modalAddProduct.show();
        });

    // handle product events
    handleAddProductEvents();
    handleProductEditEvents();
    handleEditforms();
    handleDeleteforms();

    // handle filter form
    handleFilterForm();
}

function handleFilterForm() {
    document.querySelector('#filter-product-form').addEventListener("submit", async(e) => {
        e.preventDefault();
        const filterAttribute = e.target.filterBy.value;
        const filterOrder = e.target.order.value; // 1 => asc 0 => desc
        const filteredProducts = await ProductsController.getProductList();
        const productTableBody = document.getElementById('product-table-body');

        try {
            const options = {
                attribute: filterAttribute,
                order: filterOrder
            };

            // reorganize the data based on the filtered attribute
            const filteredProductList = shuffleProducts(filteredProducts, options);

            // empty the product list table tbody
            productTableBody.innerHTML = '';

            // load the filtered products in the table.
            filteredProductList.forEach((product, index) => {
                productTableBody.innerHTML += buildProductCard(product, index);
            });

            handleEditforms();
            handleDeleteforms();
        } catch (error) {
            console.log("Error: ", error);
        }
    });
}

function handleEditforms() {
    const editForms = Array.from(document.querySelectorAll(".form-edit-product"));
    editForms.forEach(form => {
        form.addEventListener("submit", async(e) => {
            e.preventDefault();
            const button = e.target.querySelector("button");
            const label = Util.disableButton(button);
            await edit_product(e.target.docId.value);
            Util.enableButton(button, label);
        });
    });
}

function handleDeleteforms() {
    const deleteForms = Array.from(document.querySelectorAll(".form-delete-product"));
    deleteForms.forEach(form => {
        form.addEventListener("submit", async(e) => {
            e.preventDefault();
            if (!window.confirm("Press OK to delete")) {
                return;
            }
            const button = e.target.querySelector("button");
            const label = Util.disableButton(button);
            await delete_product(
                e.target.docId.value,
                e.target.imageName.value
            );
            Util.enableButton(button, label);
        });
    });
}

async function addNewProduct(form) {
    const name = form.name.value;
    const price = form.price.value;
    const summary = form.summary.value;

    const product = new Product({
        name,
        price,
        summary,
    }); //Product object

    const errors = product.validate(imageFile2Upload);

    Element.formAddProduct.errorName.innerHTML = errors.name ? errors.name : "";
    Element.formAddProduct.errorPrice.innerHTML = errors.price ?
        errors.price :
        "";
    Element.formAddProduct.errorSummary.innerHTML = errors.summary ?
        errors.summary :
        "";
    Element.formAddProduct.errorImage.innerHTML = errors.image ?
        errors.image :
        "";

    if (Object.keys(errors).length != 0) return; //error exists

    //save the product object in Firebase
    //  1. upload the image into Cloud storage => image name, url
    //  2. Store product info to Firebase with image info

    try {
        const {
            imageName,
            imageURL
        } = await ProductsController.uploadImage(
            imageFile2Upload
        );
        product.imageName = imageName;
        product.imageURL = imageURL;
        await ProductsController.addProduct(product.serialize());
        Util.info(
            "Success!",
            `${product.name} added!`,
            Element.modalAddProduct
        );
    } catch (e) {
        if (Constant.DeV) console.log(e);
        Util.info(
            "Add Product failed",
            JSON.stringify(e),
            Element.modalAddProduct
        );
    }
}

function buildProductCard(product, index) {
    return `
	<tr id="card-${product.docId}">
		<td>${index + 1}<td>
		<td>
			<img src="${product.imageURL}" class="img-fluid rounded shadow-sm" style="width: 8rem" />
		</td>
		<td>
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.summary}</p>
		</td>
		<td>$ ${product.price}</td>
		<td>
			<div class="d-inline-flex" style="gap: 10px">
				<form class="form-edit-product mr-2" method="post">
					<input type="hidden" name="docId" value="${product.docId}" />
					<button class="btn btn-outline-primary mr-2" id="edit-btn" type="submit"><i class="bx bx-edit"></i> Edit</button>
				</form>
				<form class="form-delete-product" method="post">
					<input type="hidden" name="docId" value="${product.docId}" />
					<input type="hidden" name="imageName" value="${product.imageName}" />
					<button class="btn btn-outline-danger" type="submit"><i class="bx bx-trash"></i> Delete</button>
				</form>
			</div>
		</td>
	</tr>
    `;
}

function shuffleProducts(products, options) {
    let result;
    switch (options.attribute) {
        case "name":
            result = products.sort((a, b) => {
                if (options.order === "1") { // asc order by name 
                    return a.name > b.name ? 1 : -1;
                } else {
                    return a.name < b.name ? 1 : -1;
                }
            });
            break;
        case "price":
            result = products.sort((a, b) => options.order === "1" ? a.price - b.price : b.price - a.price);
            break;
        case "id":
            result = options.order == "1" ? products.reverse() : products;
            break;
        default:
            break;
    }
    return result;
}

// product create events
export function handleAddProductEvents() {

    Element.formAddProduct.form.addEventListener("submit", async(e) => {
        e.preventDefault();
        const button = e.target.querySelector("button");
        const label = Util.disableButton(button);
        await addNewProduct(e.target);
        await products_page();
        Util.enableButton(button, label);
    });

    Element.formAddProduct.imageButton.addEventListener("change", (e) => {
        imageFile2Upload = e.target.files[0];
        if (!imageFile2Upload) {
            Element.formAddProduct.imageTag.src = null;
            return;
        }
        const reader = new FileReader();
        reader.onload = () =>
            (Element.formAddProduct.imageTag.src = reader.result);
        reader.readAsDataURL(imageFile2Upload);
    });
}

// product edit events
export function handleProductEditEvents() {
    Element.formEditProduct.imageButton.addEventListener("change", (e) => {
        imageFile2Upload = e.target.files[0];
        if (!imageFile2Upload) {
            Element.formEditProduct.imageTag.src = null;
            Element.formEditProduct.errorImage.innerHTML =
                "Image change cancelled. The original image will be used";
            return;
        }

        Element.formEditProduct.errorImage.innerHTML = "";
        const reader = new FileReader();
        reader.readAsDataURL(imageFile2Upload);
        reader.onload = () =>
            (Element.formEditProduct.imageTag.src = reader.result);
    });

    Element.formEditProduct.form.addEventListener("submit", async(e) => {
        e.preventDefault();
        const button = e.target.querySelector("button");
        const label = Util.disableButton(button);

        const p = new Product({
            name: e.target.name.value,
            price: e.target.price.value,
            summary: e.target.summary.value,
        });
        p.docId = e.target.docId.value;

        const errors = p.validate(true); // bypass image file check
        Element.formEditProduct.errorName.innerHTML = errors.name ?
            errors.name :
            "";
        Element.formEditProduct.errorPrice.innerHTML = errors.price ?
            errors.price :
            "";
        Element.formEditProduct.errorSummary.innerHTML = errors.summary ?
            errors.summary :
            "";

        if (Object.keys(errors).length != 0) {
            Util.enableButton(button, label);
            return;
        }

        try {
            if (imageFile2Upload) {
                const imageInfo = await ProductsController.uploadImage(
                    imageFile2Upload,
                    e.target.imageName.value
                );
                p.imageURL = imageInfo.imageURL;
            }
            // update firestore of the doc
            await ProductsController.updateProduct(p);

            // update web browser
            const cardTag = document.getElementById(`card-${p.docId}`);
            if (imageFile2Upload) {
                cardTag.getElementsByTagName("img")[0].src = p.imageURL;
            }
            cardTag.getElementsByClassName("card-title")[0].innerHTML = p.name;
            cardTag.getElementsByClassName(
                "card-text"
            )[0].innerHTML = `$ ${p.price}<br > ${p.summary}`;
            Util.info(
                "Updated",
                `${p.name} is updated successfully`,
                Element.modalAddProduct
            );
        } catch (error) {
            if (Constant.DeV) {
                console.log(error);
                Util.info(
                    "Update product error",
                    JSON.stringify(error),
                    Element.modalAddProduct
                );
            }
        }
        Util.enableButton(button, label);
    });
}

export async function edit_product(docId) {
    let product;
    try {
        product = await ProductsController.getProductById(docId);
        if (!product) {
            Util.info("getProductById error", "No product found by the id");
            return;
        }
    } catch (e) {
        if (Constant.DeV) {
            Util.info("getProductById", JSON.stringify(e));
            return;
        }
    }

    // show product
    Element.formEditProduct.form.docId.value = product.docId;
    Element.formEditProduct.form.imageName.value = product.imageName;
    Element.formEditProduct.form.name.value = product.name;
    Element.formEditProduct.form.price.value = product.price;
    Element.formEditProduct.form.summary.value = product.summary;
    Element.formEditProduct.imageTag.src = product.imageURL;
    Element.formEditProduct.errorImage.innerHTML = "";
    Element.formEditProduct.imageButton.value = null;
    imageFile2Upload = null;

    Element.modalEditProduct.show();
}

// delete product function
export async function delete_product(docId, imageName) {
    try {
        await ProductsController.deleteProduct(docId, imageName);
        // update browser
        const cardTag = document.getElementById('card-' + docId);
        cardTag.remove();
        Util.info('Delete', `${docId} has been deleted;`);
    } catch (error) {
        if (Constant.DeV) {
            console.log(error);
            Util.info("Delete product", JSON.stringify(error));
        }
    }
}