/*
 *   Copyright 2018 John Salatas <jsalatas@ictpro.gr>
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

function to_int(item) {
    var val = Math.round(parseFloat(item['value']), 0);
    return 0 == val || val ? val  + item['unit'] : '';
}

function array_to_int(items) {
    var res = '';
    var keys = Object.keys(items['value'])
    for (var i=0; i< keys.length; i++) {
        var item = items['value'][keys[i]]
        var val = Math.round(parseFloat(item), 0);
        if(0 == val || val) {
            if(res) {
                res += ' | '
            }
            res += val + items['unit'];
        }
    };
    return res;
}

function to_time(item) {
    var val = Math.round(parseFloat(item['value']), 0);
    var hours   = Math.floor(val / 3600);
    var minutes = Math.floor((val - (hours * 3600)) / 60);

    if (minutes < 10) {minutes = "0"+minutes;}
    return hours ? hours+':'+minutes : '';
}

function to_bool(item) {
    return parseInt(item['value'], 10) == 1;
}

function to_string(item) {
    return item['value'];
}

function fmt_tcc(item) {
    var val = Math.round(parseFloat(item['value']), 0);
    if (val === 0) {
        return to_int(item);
    }
    return "-" + to_int(item);
}

var sensors = {
    // Informational
    'cpu_cur_load': {'value': undefined, 'unit':'%', 'print': to_int,
                     'sensor_type': 'sysmon'},
    'cpu_cur_freq': {'value': undefined, 'unit':' MHz', 'print': to_int,
                     'sensor_type': 'sysmon'},
    'gpu_cur_freq': {'value': undefined, 'unit':' MHz', 'print': to_int},
    'gpu_min_limit': {'value': undefined, 'unit':'', 'print': to_int},
    'gpu_max_limit': {'value': undefined, 'unit':'', 'print': to_int},
    'battery_percentage': {'value': undefined, 'unit': '%', 'print': to_int,
                           'sensor_type': 'sysmon'},
    'battery_remaining_time': {'value': undefined, 'print': to_time,
                               'sensor_type': 'sysmon'},
    'package_temp': {'value': undefined, 'unit': ' \u2103', 'print': to_int,
                     'sensor_type': 'sysmon'},
    'fan_speeds': {'value': {}, 'unit': ' RPM', 'print': array_to_int,
                   'sensor_type': 'sysmon'},
    // Tunable
    'cpu_min_perf': {'value': undefined, 'unit':'%', 'print': to_int},
    'cpu_max_perf': {'value': undefined, 'unit':'%', 'print': to_int},
    'cpu_turbo': {'value': undefined, 'unit':'', 'print': to_bool},
    'gpu_min_freq': {'value': undefined, 'unit':' MHz', 'print': to_int},
    'gpu_max_freq': {'value': undefined, 'unit':' MHz', 'print': to_int},
    'gpu_boost_freq': {'value': undefined, 'unit':' MHz', 'print': to_int},
    'cpu_governor': {'value': undefined, 'unit':'', 'print': to_string},
    'energy_perf': {'value': undefined, 'unit':'', 'print': to_string},
    'thermal_mode': {'value': undefined, 'unit':'', 'print': to_string}, 
    'lg_battery_charge_limit': {'value': undefined, 'unit':'', 'print': to_bool},
    'lg_usb_charge': {'value': undefined, 'unit':'', 'print': to_bool},
    'lg_fan_mode': {'value': undefined, 'unit':'', 'print': to_bool},
    'powermizer': {'value': undefined, 'unit':'', 'print': to_string, 'rw_mode': 'w'},
    'intel_tcc_cur_state': {'value': undefined, 'unit':' °C', 'print': fmt_tcc},
    'intel_tcc_max_state': {'value': undefined, 'unit':' °C', 'print': fmt_tcc},
    'intel_rapl_short': {'value': undefined, 'unit':' W', 'print': to_int},
    'intel_rapl_long': {'value': undefined, 'unit':' W', 'print': to_int},
    'dell_fan_mode': {'value': undefined, 'unit': '', 'print': to_string, 'rw_mode': 'w'},

}

var available_values = {
    'cpu_governor': [],
}

var vendors = {
    'dell': {'provides': ['thermal_mode']},
    'lg-laptop': {'provides': ['lg_battery_charge_limit', 'lg_usb_charge', 'lg_fan_mode']},
    'nvidia': {'provides': ['powermizer']}
}

var model =  [
    {'type': 'header', 'id': 'processorSettings', 'text': 'Processor Settings', 'icon': 'd',
        'sensors': ['cpu_cur_load', 'cpu_cur_freq', 'gpu_cur_freq'],
        'items': [
            {'type': 'group', 'text': 'CPU Frequencies', 'items' :[
                {'type': 'slider', 'text': 'Min perf', 'min': 0, 'max': 100, 'sensor': 'cpu_min_perf'},
                {'type': 'slider', 'text': 'Max perf', 'min': 0, 'max': 100, 'sensor': 'cpu_max_perf'},
                {'type': 'switch', 'text': 'Turbo', 'sensor': 'cpu_turbo'}
            ]},
            {'type': 'group', 'text': 'GPU Frequencies', 'visible': 'showIntelGPU', 'items' :[
                {'type': 'slider', 'text': 'Min freq', 'min': 'gpu_min_limit', 'max': 'gpu_max_limit', 'sensor': 'gpu_min_freq'},
                {'type': 'slider', 'text': 'Max freq', 'min': 'gpu_min_limit', 'max': 'gpu_max_limit', 'sensor': 'gpu_max_freq'},
                {'type': 'slider', 'text': 'Boost freq', 'min': 'gpu_min_limit', 'max': 'gpu_max_limit', 'sensor': 'gpu_boost_freq'},
            ]},
            {'type': 'combobox', 'text': 'CPU Governor', 'sensor': 'cpu_governor', 'items' :[
                {'symbol': 'a', 'text': 'Performance', 'sensor_value': 'performance'},
                {'symbol': 'f', 'text': 'Powersave', 'sensor_value': 'powersave'},
                {'symbol': 'l', 'text': "Ondemand", 'sensor_value': 'ondemand'},
                {'symbol': 'i', 'text': "Userspace", 'sensor_value': 'userspace'},
                {'symbol': 'k', 'text': "Schedutil", 'sensor_value': 'schedutil'},
                {'symbol': 'f', 'text': "Conservative", 'sensor_value': 'conservative'}
            ]}
        ]
    },
    {'type': 'header', 'id': 'energyPerf', 'text': 'Energy Performance', 'icon': 'h',
        'sensors': ['battery_percentage', 'battery_remaining_time'],
        'items': [
            {'type': 'radio', 'text': 'Energy Performance Preference', 'sensor': 'energy_perf', 'items' :[
                {'symbol': 'i', 'text': 'Default', 'sensor_value': 'default'},
                {'symbol': 'a', 'text': 'Performance', 'sensor_value': 'performance'},
                {'symbol': 'k', 'text': 'Balance Performance', 'sensor_value': 'balance_performance'},
                {'symbol': 'l', 'text': 'Balance Power', 'sensor_value': 'balance_power'},
                {'symbol': 'f', 'text': 'Power', 'sensor_value': 'power'}
            ]},
            {'type': 'group', 'text': "Running Average Power Limit (RAPL)",
                'items' :[
                    {'type': 'slider', 'text': "Short Term", 'min': 1, 'max': 200, 'sensor': 'intel_rapl_short' },
                    {'type': 'slider', 'text': "Long Term", 'min': 1, 'max': 100, 'sensor': 'intel_rapl_long' },
                ]
            }
        ]
    },
    {'type': 'header', 'id': 'thermalManagement', 'text': 'Thermal Management', 'icon': 'b',
        'vendors': ['dell'],
        'sensors': ['package_temp', 'fan_speeds'],
        'items': [
            {'type': 'combobox', 'text': 'Thermal Mode', 'sensor': 'thermal_mode', 'items' :[
                 {'symbol': 'e', 'text': 'Performance', 'sensor_value': 'performance'},
                 {'symbol': 'j', 'text': 'Balanced', 'sensor_value': 'balanced'},
                 {'symbol': 'g', 'text': 'Cool Bottom', 'sensor_value': 'cool-bottom'},
                {'symbol': 'c', 'text': 'Quiet', 'sensor_value': 'quiet'}
            ]},
            {'type': 'group', 'id': 'tcc', 'text': "Thermal Control Circuit",
                'items' :[
                    {'type': 'slider', 'text': "Offset", 'min': 0, 'max': 'intel_tcc_max_state',
                     'sensor': 'intel_tcc_cur_state' },
                ]
            },
        ]
    }, 
    {'type': 'header', 'id': 'powerSupply', 'text': 'Power Supply Management', 'icon': 'm',
        'vendors': ['lg-laptop'], 
        'items': [
            {'type': 'switch', 'text': 'Battery Limit', 'sensor': 'lg_battery_charge_limit'},
            {'type': 'switch', 'text': 'USB Charge', 'sensor': 'lg_usb_charge'}
        ]
    },
    {'type': 'header', 'id': 'fanControl', 'text': 'Fan Control', 'icon': 'n',
        'vendors': ['lg-laptop', 'dell'],
        'sensors': ['package_temp', 'fan_speeds'],
        'items': [
            {'type': 'switch', 'text': 'Silent Mode', 'sensor': 'lg_fan_mode'},
            {'type': 'radio', 'text': 'Dell Fan Mode', 'sensor': 'dell_fan_mode',
             'items' :[
                 {'symbol': '◯', 'text': "Auto", 'sensor_value': '-1'},
                 {'symbol': '◐', 'text': "Low", 'sensor_value': '128'},
                 {'symbol': '●', 'text': "High", 'sensor_value': '255'},
            ]}
        ]
    },
    {'type': 'header', 'id': 'nvidiaSettings', 'text': 'Nvidia Settings', 'icon': 'o',
        'vendors': ['nvidia'],
        'items': [
            {'type': 'combobox', 'text': 'PowerMizer', 'sensor': 'powermizer', 'items' :[
                 {'text': 'Adaptive', 'sensor_value': '0'},
                 {'text': 'Prefer Max Performance', 'sensor_value': '1'},
                {'text': 'Auto', 'sensor_value': '2'}
            ]}
        ]
    }
]

function get_model() {
    return model;
}

function get_sensors() {
    return sensors;
}

function get_available_values() {
    return available_values;
}

function get_vendors() {
    return vendors;
}

function is_present(item_vendors) {
    if(item_vendors && item_vendors.length != 0) {
        for(var j=0; j< item_vendors.length; j++) {
            var vendor = vendors[item_vendors[j]]
            for(var k=0; k<vendor['provides'].length; k++) {
                if(sensors_model[vendor['provides'][k]]['value'] !== undefined) {
                    return true;
                    break;
                }
            }
        }
        return false;
    }

    return true;
}

function sensor_has_value(item) {
    if (item.type === 'header') {
        if (item.sensors) {
            for (var i = item.sensors.length - 1; i >= 0; i--) {
                var sensor = item.sensors[i]
                if (sensor in sensors_model && !!sensors_model[sensor]['value']) {
                    return true
                }
            }
        }

        for (var i = item.items.length - 1; i >= 0; i--) {
            if (sensor_has_value(item.items[i])) {
                return true
            }
        }

        return false

        // return true
    }

    if (item.type === 'group') {
        if (!item.items) {
            return true
        }
        for (var i = item.items.length - 1; i >= 0; i--) {
            if (sensor_has_value(item.items[i])) {
                return true
            }
        }
        return false
    }

    if (item.sensor in sensors_model) {
        return sensors_model[item.sensor]['value'] !== undefined
    }

    return true
}

function is_tune_sensor(sensor) {
    return 'sensor_type' in sensor && sensor['sensor_type'] === 'tune';
}

function is_info_sensor(sensor) {
    return 'sensor_type' in sensor && sensor['sensor_type'] === 'info';
}

function is_sysmon_sensor(sensor) {
    return 'sensor_type' in sensor && sensor['sensor_type'] === 'sysmon';
}