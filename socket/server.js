var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;
//var storage = require("./storage")
require('dotenv').config()

var message = require("./message")

//bouton_numero_0 = frame.digitalSamples.DIO0

const SERIAL_PORT = process.env.SERIAL_PORT;

var xbeeAPI = new xbee_api.XBeeAPI({
  api_mode: 2
});

let serialport = new SerialPort(SERIAL_PORT, {
  baudRate: parseInt(process.env.SERIAL_BAUDRATE) ,
}, function (err) {
  if (err) {
    return console.log('Error: ', err.message)
  }
});

serialport.pipe(xbeeAPI.parser);
xbeeAPI.builder.pipe(serialport);

//message.change_etat_led();

serialport.on("open", function () {
  var frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.AT_COMMAND,
    command: "NI",
    commandParameter: [],
  };

  xbeeAPI.builder.write(frame_obj);

  frame_obj = { // AT Request to be sent
    type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
    destination64: "FFFFFFFFFFFFFFFF",
    command: "NI",
    commandParameter: [],
  };
  xbeeAPI.builder.write(frame_obj);

  // --- Initialisation ------------
  xbeeAPI.builder.write(message.change_master("D0", 0x03));
  xbeeAPI.builder.write(message.change_master("D1", 0x03));
  xbeeAPI.builder.write(message.change_master("D2", 0x03));
  xbeeAPI.builder.write(message.change_master("D3", 0x03));


  xbeeAPI.builder.write(message.change_master("P1", 0x04));
  xbeeAPI.builder.write(message.change_master("D5", 0x04));
  xbeeAPI.builder.write(message.change_master("D4", 0x04));
  xbeeAPI.builder.write(message.change_master("D7", 0x04));


  xbeeAPI.builder.write(message.change_master("IC", 0x0F));

  affiche_simon()

});

async function affiche_simon() {
  await message.sleep(1000)
  tableau = message.var_tab()
  longueur = message.var_tab_long()
  console.log("Pre boucle -------------")

  for (let index = 0; index < longueur; index++) {
    const element = message.retourne_numero_pin_led(tableau[index]);

    console.log("Pin " + element + " allumer")
    xbeeAPI.builder.write(message.change_master(element, 0x05))
    await message.sleep(300)
    console.log("Pin " + element + " eteindre")
    console.log(message.change_master(element, 0x04));
    xbeeAPI.builder.write(message.change_master(element, 0x04))
    xbeeAPI.builder.write(message.change_master(element, 0x04))
    await message.sleep(60)

    console.log("-->")
  }

  console.log("Post boucle")
}

async function allume_led(numero_led) {
  const element = message.retourne_numero_pin_led(numero_led)
  xbeeAPI.builder.write(message.change_master(element, 0x05))
  await message.sleep(200)
  xbeeAPI.builder.write(message.change_master(element, 0x04))
}

// All frames parsed by the XBee will be emitted here

// storage.listSensors().then((sensors) => sensors.forEach((sensor) => console.log(sensor.data())))

var state_buttons = -1;
var return_info_after_pressed



xbeeAPI.parser.on("data", function (frame) {

  //on new device is joined, register it

  //on packet received, dispatch event
  //let dataReceived = String.fromCharCode.apply(null, frame.data);
  if (C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET === frame.type) {
    console.log("C.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET");
    let dataReceived = String.fromCharCode.apply(null, frame.data);
    console.log(">> ZIGBEE_RECEIVE_PACKET >", dataReceived);

  }

  if (C.FRAME_TYPE.NODE_IDENTIFICATION === frame.type) {
    // let dataReceived = String.fromCharCode.apply(null, frame.nodeIdentifier);
    console.log("NODE_IDENTIFICATION");
    // storage.registerSensor(frame.remote64)

  } else if (C.FRAME_TYPE.ZIGBEE_IO_DATA_SAMPLE_RX === frame.type) {

    

    state_buttons = message.receptionne_etat_bouton_retourne_nouv_presse(
      frame.digitalSamples.DIO0,
      frame.digitalSamples.DIO1,
      frame.digitalSamples.DIO2,
      frame.digitalSamples.DIO3)
    if (message.simple_nex_button_pressed(state_buttons)) {
      return_info_after_pressed = message.jeu_bouton_presse(state_buttons)
      if (return_info_after_pressed == -1) {
        allume_led(0)
        allume_led(1)
        allume_led(2)
        allume_led(3)
      }
      else {
        allume_led(state_buttons)
        if (return_info_after_pressed==1) {
          affiche_simon()
        }
      }
    }

    // storage.registerSample(frame.remote64,frame.analogSamples.AD0 )

  } else if (C.FRAME_TYPE.REMOTE_COMMAND_RESPONSE === frame.type) {
    console.log("REMOTE_COMMAND_RESPONSE")
  } else {
    console.debug(frame);
    let dataReceived = String.fromCharCode.apply(null, frame.commandData)
    console.log(dataReceived);
  }

});
