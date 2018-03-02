﻿'use strict';

wciApp.filter('niceTime', ['$filter', function ($filter) {

    return function (totalHours) {

        var hours = 0;
        var totalDays = 0;
        var days = 0;
        var totalMonths = 0;
        var months = 0;
        var years = 0;

        if (totalHours > 23) {
            hours = totalHours % 24;
            totalDays = (totalHours - hours) / 24;

            if (totalDays > 29) {
                days = totalDays % 30;
                if (days == 0) {
                    days = 30;
                }
                totalMonths = (totalDays - days) / 30;

                if (totalMonths > 12) {
                    months = (totalMonths % 12);
                    if (months == 0) {
                        months = 12;
                    }
                    years = totalMonths - months;
                }
                else {
                    months = totalMonths;
                }
            }
            else {
                days = totalDays;
            }
        }
        else {
            hours = totalHours;
        }

        var timeString = "";

        if (years > 0) {
            timeString += years;
            if (years > 1) {
                timeString += " years ";
            }
            else {
                timeString += " year ";
            }
        }
        if (months > 0) {
            timeString += months;
            if (months > 1) {
                timeString += " months ";
            }
            else {
                timeString += " month ";
            }
        }
        if (days > 0) {
            timeString += days
            if (days > 1) {
                timeString += " days ";
            }
            else {
                timeString += " day ";
            }
        }

        timeString += hours + " hours";

        return timeString;
    }

}]);