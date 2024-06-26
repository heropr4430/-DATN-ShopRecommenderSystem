import React, { useEffect } from 'react';
import ApexCharts from 'apexcharts';

const ChartOne = () => {
    useEffect(() => {
        const chartOneOptions = {
            series: [
                {
                    name: 'Doanh thu',
                    data: [37, 31, 30, 23, 26, 22, 29],
                },
                // {
                //     name: 'Product Two',
                //     data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
                // },
            ],
            legend: {
                show: false,
                position: 'top',
                horizontalAlign: 'left',
            },
            colors: ['#3C50E0', '#80CAEE'],
            chart: {
                fontFamily: 'Satoshi, sans-serif',
                height: 335,
                type: 'area',
                dropShadow: {
                    enabled: true,
                    color: '#623CEA14',
                    top: 10,
                    blur: 4,
                    left: 0,
                    opacity: 0.1,
                },
                toolbar: {
                    show: false,
                },
            },
            responsive: [
                {
                    breakpoint: 1024,
                    options: {
                        chart: {
                            height: 300,
                        },
                    },
                },
                {
                    breakpoint: 1366,
                    options: {
                        chart: {
                            height: 350,
                        },
                    },
                },
            ],
            stroke: {
                width: [2, 2],
                curve: 'straight',
            },
            markers: {
                size: 0,
            },
            labels: {
                show: false,
                position: 'top',
            },
            grid: {
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
            },
            dataLabels: {
                enabled: false,
            },
            markers: {
                size: 4,
                colors: '#fff',
                strokeColors: ['#3056D3', '#80CAEE'],
                strokeWidth: 3,
                strokeOpacity: 0.9,
                strokeDashArray: 0,
                fillOpacity: 1,
                discrete: [],
                hover: {
                    size: undefined,
                    sizeOffset: 5,
                },
            },
            xaxis: {
                type: 'category',
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
            },
            yaxis: {
                title: {
                    style: {
                        fontSize: '0px',
                    },
                },
                min: 0,
                max: 50,
            },
        };

        const chartSelector = document.querySelector('#chartOne');

        if (chartSelector) {
            const chartOne = new ApexCharts(chartSelector, chartOneOptions);
            chartOne.render();
        }
    }, []);

    return (
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
                <div className="flex flex-wrap w-full gap-3 sm:gap-5">
                    <div className="flex min-w-48">
                        <span className="flex items-center justify-center w-full h-4 mt-1 mr-2 border rounded-full max-w-4 border-primary">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
                        </span>
                        <div className="w-full ">
                            <p className="font-semibold text-primary">Tổng doanh thu</p>
                            <p className="text-sm font-medium text-nowrap">01.01.2024 - 01.07.2024</p>
                        </div>
                    </div>
                    {/* <div className="flex min-w-47.5">
                        <span className="flex items-center justify-center w-full h-4 mt-1 mr-2 border rounded-full max-w-4 border-secondary">
                            <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
                        </span>
                        <div className="w-full">
                            <p className="font-semibold text-secondary">Tô</p>
                            <p className="text-sm font-medium">12.04.2022 - 12.05.2022</p>
                        </div>
                    </div> */}
                </div>
                <div className="flex justify-end w-full max-w-44">
                    <div className="inline-flex items-center rounded-md bg-gray-100 p-1.5 dark:bg-meta-4">
                        <button className="px-3 py-1 text-xs font-medium text-black rounded hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
                            Day
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-black rounded hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                            Week
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-black bg-white rounded shadow-sm hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                            Month
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <div id="chartOne" className="-ml-5"></div>
            </div>
        </div>
    );
};

export default ChartOne;
