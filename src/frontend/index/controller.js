/*!
governify-render 1.0.0, built on: 2018-05-09
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-render#readme

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

$scope.sco = "G_PDN";
$scope.guaranteeIndex = 0;
$scope.rewardsIndex = 0;
$scope.metricsName = ["PDN", "CMM", "CCN", "EON"];
$scope.operators = ["==", "=>", "<=", ">", "<"];
$scope.result = [];
$scope.resultMessage = [];
$scope.resultConditions = [];
$scope.moth;
$scope.isResult = false;
var url = "http://localhost:5050/api/v1/translator";


$scope.restart = function () {
    $scope.sco = "G_PDN";
    $scope.guaranteeIndex = 0;
    $scope.rewardsIndex = 0;
    $scope.metricsName = ["PDN", "CMM", "CCN", "EON"];
    $scope.operators = ["==", "=>", "<=", ">", "<"];
    $scope.result = [];
    $scope.resultMessage = [];
    $scope.resultConditions = [];
    $scope.isResult = false;
    location.reload(true);
};

$scope.execute = function () {
    console.log($scope.moth);
    postUrl(url + "?moth=" + $scope.moth, (JSON.stringify($scope.model)));
};

/**
 * POST request for https URLs
 * @param url 
 * @param callback 
 */
var postUrl = (url, data, callback) => {
    if (!callback && data) {
        callback = data;
    }
    if (data) {
        data = data
            .replace(/&amp;/g, "&")
            .replace(/&gt;/g, ">")
            .replace(/&lt;/g, "<")
            .replace(/&quot;/g, '"');
    }
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: data,
        success: (body) => {
            // console.log(body);
            $scope.isResult = true;
            $scope.result = body[0];
            $scope.result.message.forEach(element => {
                let res = element.split("->")[1];
                $scope.resultMessage.push(res);
            });
            updateColors();
        }
    }).fail(function (err) {
        console.error(err);
        if (callback) {
            callback(err);
        }
    });
};

/**
 * Coloring of the tables when there is a result
 */
var updateColors = () => {
    // the coloring of the rewards
    $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of.forEach(element => {
        var index = $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of.indexOf(element);
        $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of[index].color = false;
        $scope.resultMessage.forEach(value => {
            if (element.condition === value) {
                $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of[index].color = true;
            }
        });
    });
    //the coloring of the objectives
    $scope.model.terms.guarantees[$scope.guaranteeIndex].of.forEach(element => {
        var index = $scope.model.terms.guarantees[$scope.guaranteeIndex].of.indexOf(element);
        $scope.model.terms.guarantees[$scope.guaranteeIndex].of[index].color = false;
        $scope.resultMessage.forEach(value => {
            let condition = value.split("+")[0];
            condition = condition + " " + value.split(" ")[1] + " " + value.split(" ")[2];
            if (element.objective === condition) {
                $scope.model.terms.guarantees[$scope.guaranteeIndex].of[index].color = true;
            }
        });
    });
    $scope.$apply();
};

$scope.isGuarantee = function () {
    return $scope.metricsName.indexOf($scope.sco) === -1;
};
$scope.setGuaranteeIndex = function (sco, guarantees) {
    if ($scope.isGuarantee()) {
        var i = $scope.guaranteeIndex;
        for (var gi = 0; gi < guarantees.length; gi++) {
            if (sco === guarantees[gi]["id"]) {
                $scope.guaranteeIndex = gi;
                break;
            }
        }
    } else {
        $scope.guaranteeIndex = -1;
    }
};