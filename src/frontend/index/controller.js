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
$scope.metricsName = ["AVA", "AMC", "ACL", "ODS"];
$scope.operators = ["==", "=>", "<=", ">", "<"];
$scope.result = [];
$scope.resultMessage = [];
$scope.resultConditions = [];
$scope.resultMessageObjectives = []
$scope.year;
$scope.month;
$scope.day;
$scope.newMetric;
$scope.metric = {};
$scope.guarantee = {};
$scope.reward = {};
$scope.isResult = false;
// var url = "http://localhost/api/v1/translator";
var url = "http://localhost:5050/api/v1/translator";


$scope.restart = function () {
    $scope.sco = "G_POETISA";
    $scope.guaranteeIndex = 0;
    $scope.rewardsIndex = 0;
    $scope.metricsName = ["AVA", "AMC", "ACL", "ODS"];
    $scope.operators = ["==", "=>", "<=", ">", "<"];
    $scope.result = [];
    $scope.resultMessage = [];
    $scope.resultConditions = [];
    $scope.resultMessageObjectives = [];
    $scope.metric = {};
    $scope.guarantee = {};
    $scope.reward = {};
    $scope.isResult = false;
    location.reload(true);
};

$scope.execute = function () {
    // console.log("year: " + $scope.year + " month: " + $scope.month + " day: " + $scope.day);
    var date = $scope.year + "-" + $scope.month + "-" + $scope.day;
    console.log("date: " + date);
    postUrl(url + "?date=" + date, (JSON.stringify($scope.model)));
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
    // console.log("data: " + data);
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
                if (element.split("->")[0] === 'not guarantees ') {
                    $scope.resultMessageObjectives.push(res);
                }
                $scope.resultMessage.push(res);
            });
            updateColors();
        }
    }).fail(function (err) {
        console.error("URL: " + url + " ERROR: " + JSON.stringify(err));
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
        $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of[index].color = 'red';
        if ($scope.metricsName.indexOf(element.condition.split(" ")[0]) == -1) {
            $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of[index].color = 'orange';
            console.log(element.condition);
        }
        $scope.resultMessage.forEach(value => {
            if (element.condition === value) {
                $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of[index].color = 'green';
            }
        });
    });
    //the coloring of the objectives
    $scope.model.terms.guarantees[$scope.guaranteeIndex].of.forEach(element => {
        var index = $scope.model.terms.guarantees[$scope.guaranteeIndex].of.indexOf(element);
        $scope.model.terms.guarantees[$scope.guaranteeIndex].of[index].color = 'green';
        // if ($scope.metricsName.indexOf(element.objective.split(" ")[0]) == -1) {
        //     $scope.model.terms.guarantees[$scope.guaranteeIndex].of[index].color = 'orange';
        //     console.log(element.objective);
        // }
        $scope.resultMessageObjectives.forEach(value => {
            var nodes = element.scope.node.split(",");
            if (nodes.length === 1) {
                var objective = element.objective.split(" ")[0] + "+" + nodes[0] + " " + element.objective.split(" ")[1] + " " + element.objective.split(" ")[2];
                objective = objective.replace(/&amp;/g, "&")
                    .replace(/&gt;/g, ">")
                    .replace(/&lt;/g, "<")
                    .replace(/&quot;/g, '"');
                console.log(objective);
                // let condition = value.split("+")[0];
                // condition = condition + " " + value.split(" ")[1] + " " + value.split(" ")[2];
                if (objective === value) {
                    $scope.model.terms.guarantees[$scope.guaranteeIndex].of[index].color = 'red';
                }
            } else {
                var count = 0;
                nodes.forEach(node => {
                    var objective = element.objective.split(" ")[0] + "+" + node + " " + element.objective.split(" ")[1] + " " + element.objective.split(" ")[2];
                    objective = objective.replace(/&amp;/g, "&")
                        .replace(/&gt;/g, ">")
                        .replace(/&lt;/g, "<")
                        .replace(/&quot;/g, '"');
                    if (objective === value) {
                        count += 1;
                    }
                });
                if (count > 0) {
                    $scope.model.terms.guarantees[$scope.guaranteeIndex].of[index].color = 'red';
                }
            }
        });
    });
    $scope.$apply();
};


$scope.addGuarantee = function () {
    $scope.guarantee.window.initial = new Date();
    $scope.guarantee.window.type = "static";
    console.log("Guarantee: " + $scope.guarantee);
    $scope.model.terms.guarantees[$scope.guaranteeIndex].of.push($scope.guarantee);
    $scope.guarantee = {};
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

$scope.addReward = function () {
    console.log("Reward: " + $scope.reward);
    $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of.push($scope.reward);
    $scope.reward = {};
};

$scope.addMetric = function () {
    $scope.metricsName.push($scope.newMetric);
    var aux = $scope.metric;
    $scope.model.terms.metrics[$scope.newMetric] = aux;
    $scope.newMetric = '';
    $scope.metric = {};
};

$scope.deleteMetric = function (metric) {
    var indexMetric = $scope.metricsName.indexOf(metric);
    $scope.metricsName.splice(indexMetric, 1);
    delete $scope.model.terms.metrics[metric];
};

$scope.deleteObjective = function (objective) {
    console.log(objective.objective);
    var indexObjective = $scope.model.terms.guarantees[$scope.guaranteeIndex].of.indexOf(objective);
    $scope.model.terms.guarantees[$scope.guaranteeIndex].of.splice(indexObjective, 1);
};

$scope.deleteReward = function (reward) {
    console.log(reward);
    var indexReward = $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of.indexOf(reward);
    $scope.model.terms.pricing.billing.rewards[$scope.rewardsIndex].of.splice(indexReward, 1);
};