/*
 *  Copyright (c) Sunday, 30th June 2013 Avinash Vadlamudi (avinash.vadlamudi@gmail.com)
 */

function serialize(url, query) {
    return url + "?" + decodeURIComponent($.param(query));
}