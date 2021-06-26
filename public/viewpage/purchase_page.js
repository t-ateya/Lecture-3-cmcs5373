import * as Element from "./element.js";
import * as Route from "../controller/route.js";
import * as FirebaseController from "../controller/firebase_controller.js";
import * as Auth from "../controller/auth.js";
import * as Constant from "../model/constant.js";
import * as Util from "./util.js";

export function addEventListeners() {
  Element.menuPurchases.addEventListener("click", async () => {
    history.pushState(null, null, Route.routePathnames.PURCHASE);
    await purchase_page();
  });
}

export async function purchase_page() {
  if (!Auth.currentUser) {
    Element.root.innerHTML = "<h1> Protected Page </h1>";
    return;
  }

  let html = "<h1> Purchases Page </h1>";

  let carts;
  try {
    carts = await FirebaseController.getPurchaseHistory(Auth.currentUser.uid);
    if (carts.length == 0) {
      html += "<h2> No purchase History found! </h2>";
      Element.root.innerHTML = html;
      return;
    }
  } catch (error) {
    if (Constant.DeV) console.log(error);
    Util.info("Error in getPurchaseHistory", JSON.stringify(error));
  }

  html += `
    <table class="table table-striped">
    <thead>
      <tr>
        <th scope="col">View</th>
        <th scope="col">Items</th>
        <th scope="col">Price</th>
        <th scope="col">Date</th>
      </tr>
    </thead>
    <tbody>
    `;

  for (let i = 0; i < carts.length; i++) {
    html += `
            <tr>
                <td>
                    <button class = "btn btn-outline-primary">Details</button>
                </td>
                <td>
                    ${carts[i].getTotalQty()}
                </td>
                <td>
                    ${Util.currency(carts[i].getTotalPrice())}
                </td>
                <td>
                    ${Date(carts[i].timestamp).toString()}
                </td>
            </tr>
        `;
  }
  html += "</tbody></table>";

  Element.root.innerHTML = html;
}
