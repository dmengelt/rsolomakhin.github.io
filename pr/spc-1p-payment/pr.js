/* exported triggerSPC */
const textEncoder = new TextEncoder();
let credentialId;

/**
 * Converts an ArrayBuffer into a string.
 */
function arrayBufferToString(input) {
  return String.fromCharCode(...new Uint8Array(input));
}
/**
 * Converts an ArrayBuffer into a base64 encoded string.
 */
function arrayBufferToBase64(input) {
  return btoa(arrayBufferToString(input));
}
/**
 * Converts a base64 encoded string into Unit8Array.
 */
function base64ToArray(input) {
  return Uint8Array.from(atob(input), c => c.charCodeAt(0))
}
/**
 * Converts a PaymentResponse or a PublicKeyCredential into an dictionary.
 */
function objectToDictionary(input) {
  let output = {};
  if (input.requestId) {
    output.requestId = input.requestId;
  }
  if (input.id) {
    output.id = input.id;
  }
  if (input.rawId && input.rawId.constructor === ArrayBuffer) {
    output.rawId = arrayBufferToBase64(input.rawId);
  }
  if (input.response && (input.response.constructor ===
      AuthenticatorAttestationResponse || input.response.constructor ===
      AuthenticatorAssertionResponse || input.response.constructor === Object
      )) {
    output.response = objectToDictionary(input.response);
  }
  if (input.attestationObject && input.attestationObject.constructor ===
    ArrayBuffer) {
    output.attestationObject = arrayBufferToBase64(input.attestationObject);
  }
  if (input.authenticatorData && input.authenticatorData.constructor ===
    ArrayBuffer) {
    output.authenticatorData = arrayBufferToBase64(input.authenticatorData);
  }
  if (input.authenticatorData && input.authenticatorData.constructor ===
    String) {
    output.authenticatorData = input.authenticatorData;
  }
  if (input.clientDataJSON && input.clientDataJSON.constructor ===
    ArrayBuffer) {
    output.clientDataJSON = arrayBufferToString(input.clientDataJSON);
  }
  if (input.clientDataJSON && input.clientDataJSON.constructor ===
    String) {
    output.clientDataJSON = atob(input.clientDataJSON);
  }
  if (input.info) {
    output.info = objectToDictionary(input.info);
  }
  if (input.signature && input.signature.constructor === ArrayBuffer) {
    output.signature = arrayBufferToBase64(input.signature);
  }
  if (input.signature && input.signature.constructor === String) {
    output.signature = input.signature;
  }
  if (input.userHandle && input.userHandle.constructor === ArrayBuffer) {
    output.userHandle = arrayBufferToBase64(input.userHandle);
  }
  if (input.userHandle && input.userHandle.constructor === String) {
    output.userHandle = input.userHandle;
  }
  if (input.type) {
    output.type = input.type;
  }
  if (input.methodName) {
    output.methodName = input.methodName;
  }
  if (input.details) {
    output.details = objectToDictionary(input.details);
  }
  if (input.appid_extension) {
    output.appid_extension = input.appid_extension;
  }
  if (input.challenge) {
    output.challenge = input.challenge;
  }
  if (input.echo_appid_extension) {
    output.echo_appid_extension = input.echo_appid_extension;
  }
  if (input.echo_prf) {
    output.echo_prf = input.echo_prf;
  }
  if (input.prf_not_evaluated) {
    output.prf_not_evaluated = input.prf_not_evaluated;
  }
  if (input.prf_results) {
    output.prf_results = objectToDictionary(input.prf_results);
  }
  if (input.user_handle) {
    output.user_handle = input.user_handle;
  }
  if (input.authenticator_data) {
    output.authenticator_data = input.authenticator_data;
  }
  if (input.client_data_json) {
    output.client_data_json = atob(input.client_data_json);
  }
  if (input.shippingAddress) {
    output.shippingAddress = input.shippingAddress;
  }
  if (input.shippingOption) {
    output.shippingOption = input.shippingOption;
  }
  if (input.payerName) {
    output.payerName = input.payerName;
  }
  if (input.payerEmail) {
    output.payerEmail = input.payerEmail;
  }
  if (input.payerPhone) {
    output.payerPhone = input.payerPhone;
  }
  return output;
}
/**
 * Converts a PaymentResponse or a PublicKeyCredential into a string.
 */
function objectToString(input) {
  return JSON.stringify(objectToDictionary(input), undefined, 2);
}

/**
 * Initializes the payment request object.
 * @return {PaymentRequest} The payment request object.
 */
async function buildPaymentRequest() {
  if (!window.PaymentRequest) {
    return null;
  }
  let request = null;
  try {
    // Documentation:
    // https://github.com/w3c/secure-payment-confirmation
    const challenge = textEncoder.encode('network_data');
    const updatedInstrument = {
      displayName: 'My Troy Card',
      icon: 'https://rsolomakhin.github.io/pr/spc/troy-alt-logo.png',
    };
    const supportedInstruments = [{
      supportedMethods: 'secure-payment-confirmation',
      data: {
        credentialIds: [base64ToArray(credentialId)],
        instrument: updatedInstrument,
        networkData: challenge,
        challenge,
        timeout: 60000,
        payeeOrigin: window.location.origin,
        rpId: 'spc-1p-payment-demo.glitch.me',
      },
    }];
    const details = {
      total: {
        label: 'Total',
        amount: {
          currency: 'USD',
          value: '0.01',
        },
      },
    };
    request = new PaymentRequest(supportedInstruments, details);
  } catch (err) {
    error(err);
  }
  return request;
}

/**
 * Launches payment request for Android Pay.
 */
async function triggerSPC() {
  if (!window.PaymentRequest) {
    error('PaymentRequest API is not supported.');
    return;
  }
  const request = await buildPaymentRequest();
  if (!request) return;
  try {
    const instrumentResponse = await request.show();
    await instrumentResponse.complete('success')
    console.log(instrumentResponse);
    info(document.getElementById('credential').value + ' payment response: ' +
      objectToString(instrumentResponse));
  } catch (err) {
    error(err);
  }
}

window.addEventListener('message', e => {
  if (e.data.type !== 'enrollment') return;
  credentialId = e.data.credential;
  document.getElementById("triggerSPC").disabled = false;
  info('Received credential ID: ' + credentialId);
});
