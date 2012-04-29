$(function () {
    var chart;
    var g = 0;
    var b = 0;
    var average = 30;

    function ping() {
        $.ajax({
            url: 'http://' + $('#host').val().replace('{rand}', Math.random()),
            type: 'GET',
            dataType: 'html',
            timeout: $('#tval').val(),
            beforeSend: function () {
                requestTime = new Date().getTime();
            },
            complete: function (data, status) {
                responseTime = new Date().getTime();
                pingDelay = Math.abs(requestTime - responseTime);
                if (status === 'timeout' || status === 'abort' || pingDelay > ($('#tval').val()-50)) {
                    chart.series[0].addPoint({x:responseTime / 1000, y: average, marker: {radius: 5, fillColor: '#c00'}});
                    b = b + 1;
                } else {
                    chart.series[0].addPoint([responseTime / 1000, pingDelay]);
                    g = g + 1;
                    average = Math.round((average*(g)+pingDelay)/(g+1));
                    $('#average').text(average);
                }
                chart.series[1].setData([{name:'Good ('+g+')', y:g, color: '#0c0'}, {name:'Bad ('+b+')', y:b, color: '#c00'}]);
                if (b > 0 && g > 0)
                    $('#badper').text(Math.round(b*100/(g+b)));
                $('#lastping').text(pingDelay);
            }
        });
    }


    $(document).ready(function () {
        chart = new Highcharts.Chart({
            chart: {
                renderTo: 'container',
                type: 'scatter'
            },
            title: {
                text: 'Ping statistics'
            },
            subtitle: {
                text: 'timeouts in red'
            },
            xAxis: {
                title: {
                    text: 'time'
                },
                labels: {
                    formatter: function () {
                        var d = new Date();
                        d.setTime(this.value * 1000);
                        return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'ms'
                },
                labels: {
                    formatter: function () {
                        return this.value + 'ms'
                    }
                }
            },
            tooltip: false,
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 3,
                        fillColor: '#0c0'
                    }
                }
            },
            series: [{
                name: 'Response time',
                marker: {
                    symbol: 'circle'
                },
                data: []

            }, {
                type: 'pie',
                name: 'timeout percentage',
                data: [],
                center: [140, 80],
                size: 140
            }]
        });

        ping();
        loop = setInterval(ping, $('#pval').val()*1000);

        $('#pval').change(function() {
            clearInterval(loop);
            loop = setInterval(ping, $('#pval').val()*1000);
        });
    });
});