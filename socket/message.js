var SerialPort = require('serialport');
var xbee_api = require('xbee-api');
var C = xbee_api.constants;

var tableau_etats_boutons = [0, 0, 0, 0]
var mon_tableau_sequence_attendue = [0, 1, 2, 3,-1,-1,-1,-1,-1,-1,
                                    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
                                    -1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
var pointeur_tableau_attendue = 0
var longueur_sequence_attendue = 4



module.exports.var_tab = function () { return mon_tableau_sequence_attendue }
module.exports.var_tab_long = function () { return longueur_sequence_attendue }

/*
    Return 0 si bouton appuyé dans la sequence
    Return 1 si bouton appuyé rajouté à la sequence (ie apres la sequence complete) -> Changer de joueur
    Return -1 si mauvais bouton
*/
module.exports.jeu_bouton_presse = function (nouv_bouton_presse) {
    //console.log(">>"+pointeur_tableau_attendue+">>")
    if (pointeur_tableau_attendue == longueur_sequence_attendue) {
        mon_tableau_sequence_attendue[pointeur_tableau_attendue] = nouv_bouton_presse
        longueur_sequence_attendue = longueur_sequence_attendue + 1
        pointeur_tableau_attendue = 0

        return 1
    }
    if (mon_tableau_sequence_attendue[pointeur_tableau_attendue] == nouv_bouton_presse) {
        pointeur_tableau_attendue = pointeur_tableau_attendue + 1
        return 0
    }
    pointeur_tableau_attendue = 0
    longueur_sequence_attendue = 4
    return -1

}

/*
    Prend en entree 4 boutons, nommés de 0 à 3
    Retourne le numéro du bouton préssé
    Si aucun bouton n'a été pressé (car le changement est du à un relachement), retourne -1

    //TODO Refactorer en utilisant un tableau serait mieux
*/
module.exports.receptionne_etat_bouton_retourne_nouv_presse = function (b0, b1, b2, b3) {
    bouton_presse = -1
    if ((b0 == 1) && (tableau_etats_boutons[0] == 0)) {
        bouton_presse = 0;
    }
    if ((b1 == 1) && (tableau_etats_boutons[1] == 0)) {
        bouton_presse = 1;
    }
    if ((b2 == 1) && (tableau_etats_boutons[2] == 0)) {
        bouton_presse = 2;
    }
    if ((b3 == 1) && (tableau_etats_boutons[3] == 0)) {
        bouton_presse = 3;
    }
    tableau_etats_boutons[0] = b0;
    tableau_etats_boutons[1] = b1;
    tableau_etats_boutons[2] = b2;
    tableau_etats_boutons[3] = b3;

    return (bouton_presse);
};

/*
    Retourne 1 si entree superieure ou egale à 0
    Retourne 0 sinon
*/
module.exports.simple_nex_button_pressed = function (etat_presse) {
    if (etat_presse >= 0) {
        return 1
    }
    else {
        return 0
    }
}


module.exports.change_master = function (commande, parametre) {
    ma_commande = {
        type: C.FRAME_TYPE.REMOTE_AT_COMMAND_REQUEST,
        destination64: "FFFFFFFFFFFFFFFF",
        command: commande,
        commandParameter: [parametre]
    }
    return ma_commande
};

module.exports.sleep = function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.retourne_numero_pin_led = function (numero) {
    switch (numero) {
        case 0:
            return "D4"
        case 1:
            return "D5"
        case 2:
            return "D7"
        case 3:
            return "P1"


        default:
            break;
    }
}
