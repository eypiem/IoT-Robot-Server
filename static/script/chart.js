var temperature_chart_ctx;
var pressure_chart_ctx;
var temperature_chart;
var pressure_chart;
var temperature = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var pressure = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];


document.addEventListener('DOMContentLoaded', () => {
    temperature_chart_ctx = document.getElementById('temperature-chart-canvas').getContext('2d');
    pressure_chart_ctx = document.getElementById('pressure-chart-canvas').getContext('2d');
    temperature_chart = new Chart(temperature_chart_ctx, {
            type: 'line',
            data: {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temperature,
                    borderColor: [
                        'rgba(255, 69, 0, 1)',
                    ],
                    borderWidth: 3,
                    pointHitRadius: 5,
                    backgroundColor: 'rgba(255, 69, 0, .2)',
                    pointBackgroundColor: 'rgba(255, 255, 255, 1)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    pressure_chart = new Chart(pressure_chart_ctx, {
            type: 'line',
            data: {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                datasets: [{
                    label: 'Pressure (Pa)',
                    data: pressure,
                    borderColor: [
                        'rgba(31, 255, 127, 1)',
                    ],
                    borderWidth: 3,
                    pointHitRadius: 5,
                    backgroundColor: 'rgba(31, 255, 127, .2)',
                    pointBackgroundColor: 'rgba(255, 255, 255, 1)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: false,
                            min: 84000,
                            max: 86000,
                        }
                    }]
                }
            }
        });
});

var temperatureLatestLabel = 10;
function updateTemperatureChart(newData) {
    temperature_chart.data.labels.push(++temperatureLatestLabel);
    temperature_chart.data.datasets.forEach((dataset) => {
        dataset.data.push(newData);
    });
    temperature_chart.data.labels.shift();
    temperature_chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
    });
    temperature_chart.update();
}

var pressureLatestLabel = 10;
function updatePressureChart(newData) {
    pressure_chart.data.labels.push(++pressureLatestLabel);
    pressure_chart.data.datasets.forEach((dataset) => {
        dataset.data.push(newData);
    });
    pressure_chart.data.labels.shift();
    pressure_chart.data.datasets.forEach((dataset) => {
        dataset.data.shift();
    });
    pressure_chart.update();
}
