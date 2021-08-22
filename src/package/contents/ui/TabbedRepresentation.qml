/*
 *   Copyright 2021 Vincent Grabner <frankenfruity@protonmail.com>
 *
 *   This program is free software; you can redistribute it and/or modify
 *   it under the terms of the GNU Library General Public License as
 *   published by the Free Software Foundation; either version 2 or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details
 *
 *   You should have received a copy of the GNU Library General Public
 *   License along with this program; if not, write to the
 *   Free Software Foundation, Inc.,
 *   51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

import QtQuick 2.3
import QtQuick.Controls 2.2

import QtQuick.Layouts 1.1
import QtQuick.Window 2.2

import org.kde.plasma.core 2.0 as PlasmaCore
import org.kde.plasma.extras 2.0 as PlasmaExtras

import '../code/utils.js' as Utils

GridLayout {
    id: tabbedRepresentation

    Layout.minimumWidth: units.gridUnit * 24
    Layout.minimumHeight: units.gridUnit * 24
    Layout.preferredWidth: Layout.minimumWidth
    Layout.preferredHeight: Layout.minimumHeight

    property var model: Utils.get_model()
    property var vendors: Utils.get_vendors()

    property var currentItemId: undefined

    Component {
        id: header
        Header {
        }
    }

    Component {
        id: toolButton
        ToolButton {
            id: button
            text: undefined
            property var symbolText
            property var itemId
            contentItem: GridLayout {
                Text {
                    id: buttonText
                    text: button.symbolText
                    font.family: symbolsFont.name
                    font.pointSize: theme.smallestFont.pointSize * 2.5
                    color: theme.textColor

                    horizontalAlignment: Text.AlignHCenter
                    verticalAlignment: Text.AlignVCenter

                    Layout.fillWidth: true
                    Layout.fillHeight: true
                }
            }
            background: Rectangle {
                color: Qt.rgba(0, 0, 0, 0)
            }
            MouseArea {
                anchors.fill: parent
                hoverEnabled: true
                onEntered: {
                    buttonText.color = theme.highlightColor
                }
                onExited: {
                    buttonText.color = theme.textColor
                }
                onClicked: {
                    show_item(itemId)
                }
            }
        }
    }

    Component {
        id: scrollComponent
        ScrollView {
            id: scrollRoot
            property alias props: scrolledHeader.props
            property alias showIcon: scrolledHeader.showIcon

            ScrollBar.horizontal.policy: ScrollBar.AlwaysOff
            ScrollBar.vertical.interactive: false

            Header {
                id: scrolledHeader
                width: scrollRoot.width
            }
        }
    }

    Component.onCompleted: {
        if(isReady) {
            initialize()
            sensorsValuesChanged()
        }
    }

    Connections {
        target: main
        onDataSourceReady: {
            initialize()
            sensorsValuesChanged()
        }
    }

    Connections {
        target: plasmoid.configuration
        onShowIntelGPUChanged: {
            initialize()
        }
    }

    function initialize() {
        remove_children()
        initialize_toolbar()

        show_item(currentItemId ? currentItemId : "processorSettings")
    }

    function initialize_toolbar() {
        for(var i = 0; i < model.length; i++) {
            var item = model[i];
            // if(!Utils.is_present(item['vendors'])) {
            if(!Utils.sensor_has_value(item)) {
                continue
            }
            switch (item.type) {
                case 'header': {
                    var props = { symbolText: item['icon'], itemId: item['id'] }
                    toolButton.createObject(toolbar, props)
                    break
                }
                default: console.log("unkonwn type: " + item.type)
            }
        }
    }

    function remove_children() {
        for(var i = toolbar.children.length; i > 0 ; i--) {
            toolbar.children[i-1].destroy()
        }
    }

    function set_indicator_position(itemId) {
        for(var i = toolbar.children.length; i > 0 ; i--) {
            var button = toolbar.children[i-1];
            if (button.itemId != itemId) {
                continue
            }

            var res = button.mapToItem(toolbar, 0, 0)
            toolbarIndicator.y = res.y
            toolbarIndicator.height = button.height
        }
    }

    function show_item(itemId) {
        var item = undefined
        model.forEach(m => {
            if (!item && m['id'] == itemId) {
                item = m
            }
        })
        if (!item) {
            print("error: Couldn't find item with id=" + itemId)
            return
        }

        set_indicator_position(itemId)

        var props = {'props': item, showIcon: false};

        if (tabbedRepresentation.currentItemId &&
            tabbedRepresentation.currentItemId == itemId)
        {
            stackView.pop(StackView.Immediate)
            stackView.push(scrollComponent, props, StackView.Immediate)
            return
        }

        while (stackView.depth > 1) {
            stackView.pop(StackView.PopTransition)
        }

        stackView.push(scrollComponent, props, StackView.PushTransition)
        tabbedRepresentation.currentItemId = itemId
    }


    RowLayout {
        spacing: 0

        // Tab bar
        GridLayout {
            Layout.alignment: Qt.AlignTop | Qt.AlignLeft

            RowLayout {
                ColumnLayout {
                    id: toolbar
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                }
                Rectangle {
                    id: toolbarIndicator
                    x: toolbar.width
                    height: toolbar.height
                    // This makes the plasmoid crash on removal.
                    // width: toolbar.width * 0.075
                    width: units.smallSpacing.toFixed(3) * 0.5
                    color: theme.highlightColor

                    Behavior on y { PropertyAnimation {} }
                }

            }
        }

        // Vertical separator
        GridLayout {
            Rectangle {
                id: separator
                width: 1
                color: Qt.rgba(theme.textColor.r,
                               theme.textColor.g,
                               theme.textColor.b, 0.25)
                Layout.fillHeight: true
            }
        }

        RowLayout {
            spacing: 0
            clip: true

            // spacer
            Rectangle {
                width: units.smallSpacing
                color: Qt.rgba(1, 1, 1, 0)
                Layout.fillHeight: true
            }

            StackView {
                id: stackView

                Layout.alignment: Qt.AlignTop | Qt.AlignLeft
                Layout.fillWidth: true
                Layout.fillHeight: true
            }
        }
    }

}