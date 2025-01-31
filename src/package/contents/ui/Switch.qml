/*
    SPDX-FileCopyrightText: 2018 John Salatas <jsalatas@ictpro.gr>
    SPDX-License-Identifier: GPL-2.0-or-later
*/

import QtQuick 2.3
import QtQuick.Layouts 1.1
import QtQuick.Controls 2.2

RowLayout {
    property alias text: checkbox_title.text
    property alias checked: checkBox.checked
    property bool acceptingChanges: false

    property var props
    spacing: 10

    property var sensorModel: undefined


    function onValueChanged() {
        acceptingChanges = false
        checked = (sensorModel.value === 'true')
        acceptingChanges = true
    }

    onPropsChanged: {
        text = props['text']

        sensorModel = main.sensorsMgr.getSensor(props['sensor'])
        sensorModel.onValueChanged.connect(onValueChanged)
        onValueChanged()
    }

    Component.onCompleted: {
        onValueChanged()
        acceptingChanges = true
    }

    Component.onDestruction: {
        sensorModel.onValueChanged.disconnect(onValueChanged)
    }

    Label {
        Layout.alignment: Qt.AlignVCenter
        id: checkbox_title
        font.pointSize: theme.smallestFont.pointSize
        color: theme.textColor
        horizontalAlignment: Text.AlignRight
        Layout.minimumWidth: units.gridUnit * 4
    }

    CheckBox {
        id: checkBox
        onCheckedChanged: {
            if(acceptingChanges) {
                updateSensor(sensorModel.sensor, checked)
            }
        }
    }
}
