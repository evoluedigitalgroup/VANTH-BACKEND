import axios from "axios";
import config from "../config/index.js";
import lang from "../helpers/locale/lang.js";

const axiosRequest = (method, path, body = "") => {
  return new Promise((resolve, reject) => {
    const requestSecret = config.pagarMeSecretKey;

    const FULL_URL = config.pagarMeBaseUrl + path;

    const requestConfig = {
      auth: {
        username: requestSecret,
      },
    };
    if (method === "GET") {
      axios
        .get(FULL_URL, requestConfig)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    } else if (method === "POST") {
      axios
        .post(FULL_URL, body, requestConfig)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    } else if (method === "PUT") {
      axios
        .put(FULL_URL, body, requestConfig)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    } else if (method === "DELETE") {
      axios
        .delete(FULL_URL, requestConfig)
        .then(response => {
          resolve(response);
        })
        .catch(err => {
          reject(err);
        });
    }
  });
};

const createPagarMeUser = userObj => {
  return new Promise((resolve, reject) => {
    const path = `/customers`;
    const body = userObj;
    axiosRequest("POST", path, body)
      .then(response => {
        resolve(response.data);
      })
      .catch(e => {
        reject(e.response.data);
      });
  });
};

const createCard = (custId, cardData) => {
  return new Promise((resolve, reject) => {
    const path = `/customers/${custId}/cards`;
    const body = cardData;
    axiosRequest("POST", path, body)
      .then(response => {
        resolve({
          success: true,
          data: response.data,
          message: lang.cardCreated,
        });
      })
      .catch(e => {
        reject(e.response.data);
        // resolve({
        //   success: false,
        //   data: null,
        //   message: lang.tokenNoFound,
        // });
      });
  });
};

const listCard = custId => {
  return new Promise((resolve, reject) => {
    const path = `/customers/${custId}/cards`;
    axiosRequest("GET", path)
      .then(response => {
        resolve(response.data);
      })
      .catch(e => {
        reject(e.response.data);
      });
  });
};

const getCard = (custId, cardId) => {
  return new Promise((resolve, reject) => {
    const path = `/customers/${custId}/cards/${cardId}`;
    axiosRequest("GET", path)
      .then(response => {
        resolve(response.data);
      })
      .catch(e => {
        reject(e.response.data);
      });
  });
};

const deleteCard = (custId, cardId) => {
  return new Promise((resolve, reject) => {
    const path = `/customers/${custId}/cards/${cardId}`;
    axiosRequest("DELETE", path)
      .then(response => {
        resolve({
          success: true,
          // data: response.data,
          message: lang.cardDeleted,
        });
      })
      .catch(e => {
        console.log("e ", e);
        reject({ success: false, message: lang.noCardFound });
      });
  });
};

const subscriptionsCards = cardId => {
  return new Promise((resolve, reject) => {
    const path = `/subscriptions?card_id=${cardId}&status=active`;
    axiosRequest("GET", path)
      .then(response => {
        resolve(response.data);
      })
      .catch(e => {
        reject(e.response.data);
      });
  });
};

const cancelSubscriptionsCards = subscriptionId => {
  return new Promise((resolve, reject) => {
    console.log("subscriptionId::", subscriptionId);
    const path = `/subscriptions/${subscriptionId}`;
    axiosRequest("DELETE", path)
      .then(response => {
        resolve({
          success: true,
          data: response.data,
          // message: lang.paymentProcessing,
        });
      })
      .catch(e => {
        // console.log("e", e);
        reject(e.response.data);
        // reject({ success: false, message: lang.paymentFailed });
      });
  });
};

const deleteAddress = (custId, addId, address) => {
  return new Promise((resolve, reject) => {
    const path = `/customers/${custId}/addresses/${addId}`;
    const body = address;
    axiosRequest("DELETE", path, body)
      .then(response => {
        resolve({
          success: true,
          data: response.data,
          message: lang.addressUpdated,
        });
      })
      .catch(e => {
        console.log("e", e);
        reject({ success: false, message: lang.addressNoFound });
      });
  });
};

const createAddress = (custId, address) => {
  return new Promise((resolve, reject) => {
    const path = `/customers/${custId}/addresses`;
    const body = address;
    axiosRequest("POST", path, body)
      .then(response => {
        resolve({
          success: true,
          data: response.data,
          message: lang.addressUpdated,
        });
      })
      .catch(e => {
        console.log("e createAddress :::", e);

        reject({ success: false, message: lang.addressNoFound });
      });
  });
};

const getAddress = custId => {
  return new Promise((resolve, reject) => {
    const path = `/customers/${custId}/addresses`;

    axiosRequest("GET", path)
      .then(response => {
        resolve({
          success: true,
          data: response.data,
          message: lang.addressUpdated,
        });
      })
      .catch(e => {
        reject({ success: false, message: lang.addressNoFound });
      });
  });
};

const payWithCard = orderObj => {
  return new Promise((resolve, reject) => {
    const path = `/orders`;
    const body = orderObj;
    axiosRequest("POST", path, body)
      .then(response => {
        resolve({
          success: true,
          data: response.data,
          message: lang.paymentProcessing,
        });
      })
      .catch(e => {
        // console.log("e", e);
        reject(e.response.data);
        // reject({ success: false, message: lang.paymentFailed });
      });
  });
};

const createRecipientUser = userObj => {
  return new Promise((resolve, reject) => {
    const path = `/recipients`;
    const body = userObj;
    axiosRequest("POST", path, body)
      .then(response => {
        resolve(response.data);
      })
      .catch(e => {
        reject(e);
      });
  });
};

const subscribePlan = userObj => {
  return new Promise((resolve, reject) => {
    const path = `/subscriptions`;
    const body = userObj;
    axiosRequest("POST", path, body)
      .then(response => {
        resolve(response.data);
      })
      .catch(e => {
        console.log('e.response : ', e.response)
        reject(e.response.data);
      });
  });
};

const refundUserPayment = chargId => {
  return new Promise((resolve, reject) => {
    const path = `/charges/${chargId}`;
    // const body = userObj;
    axiosRequest("DELETE", path)
      .then(response => {
        resolve(response.data);
      })
      .catch(e => {
        reject(e);
      });
  });
};

export {
  createPagarMeUser,
  createCard,
  deleteCard,
  listCard,
  getCard,
  deleteAddress,
  createAddress,
  getAddress,
  payWithCard,
  createRecipientUser,
  subscribePlan,
  refundUserPayment,
  subscriptionsCards,
  cancelSubscriptionsCards,
};
