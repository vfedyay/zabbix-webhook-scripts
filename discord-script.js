/*
Works with Zabbix 5.0 LTS

original code from (worked with Zabbix 4.4)
https://git.zabbix.com/projects/ZBX/repos/zabbix/browse/templates/media/discord

JS preprocessing and additional JS objects
https://www.zabbix.com/documentation/5.0/manual/config/items/preprocessing/javascript/javascript_objects
 
Zabbix.Log 4 - debug
Zabbix.Log 3 - warnings
*/

function stringTruncate(str, len) {
    return str.length > len ? str.substring(0, len - 3) + '...' : str;
}

try {
    Zabbix.Log(4, '[ Discord Webhook ] Executed with params: ' + value);

    var params = JSON.parse(value);

    if (!params.WebHookURL) {
        throw 'Cannot get WebHook URL';
    }
    else {
        params.WebHookURL = params.WebHookURL.replace('/api/', '/api/v7/') + '?wait=True';
    }

    var fields = [],
    body = { };

    body.username = stringTruncate(params.Subject, 256);
    body.content = stringTruncate(params.Message, 2048);

    // Sending request to webhook
    // and reading response and status
    var req = new CurlHttpRequest();

    if (typeof params.HTTPProxy === 'string' && params.HTTPProxy.trim() !== '') {
        req.SetProxy(params.HTTPProxy);
    }
    req.AddHeader('Content-Type: application/json');

    var resp = req.Post(params.WebHookURL, JSON.stringify(body)),
        data = JSON.parse(resp);

    Zabbix.Log(4, '[ Discord Webhook ] JSON: ' + JSON.stringify(body));
    Zabbix.Log(4, '[ Discord Webhook ] Response: ' + resp);

    if (data.id) {
        return resp;
    }
    else {
        var message = ((typeof data.message === 'string') ? data.message : 'Unknown error');

        Zabbix.Log(3, '[ Discord Webhook ] FAILED with response: ' + resp);
        throw message + '. For more details check zabbix server log.';
    }
}
catch (error) {
    Zabbix.Log(3, '[ Discord Webhook ] ERROR: ' + error);
    throw 'Sending failed: ' + error;
}