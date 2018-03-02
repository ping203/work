const logicResponse = require('../../../common/logicResponse');
var FileUtil = require('../../src/utils/FileUtil');
var StringUtil = require('../../src/utils/StringUtil');

let exp = module.exports;
exp.get = async function (data) {
    var path_assets = './public/fishjoy_game/res/raw-assets';
    var path_internal = './public/fishjoy_game/res/raw-internal';
    var path_assets_list = FileUtil.listDir(path_assets, true, false);
    var path_internal_list = FileUtil.listDir(path_internal, true, false);
    return logicResponse.askEjs('pages-hot-res', {
        title: "Hot Resources Replace(json and pictures)",
        path_list: ['path_01', 'path_02', 'path_03'],
        path_assets_list: path_assets_list,
        path_internal_list: path_internal_list,
    });
};