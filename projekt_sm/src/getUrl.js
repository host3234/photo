define({
    load: function (name, req, load, config) {
        load(req.toUrl(name));
    }
});

