function debug_log(msg)
{
    $.ajax({
     url: '/debug/log/',
     type: 'POST',
     contentType: 'text/html',
     data: msg,
     processData: false,
     async: false
  });
}

function debug_bin(bin)
{
    $.ajax({
     url: '/debug/bin/',
     type: 'POST',
     contentType: 'application/octet-stream',
     data: bin,
     processData: false,
     async: false
  });
}

function read_str(buf,index)
{
  ret = ''
  while(true)
  {
    dword = buf[index]
    c1 = dword % 256
    c2 = (dword >> 8) % 256
    c3 = (dword >> 16) % 256
    c4 = (dword >> 24) % 256
    if(c1 == 0)
      break;
    ret += String.fromCharCode(c1)
    if(c2 == 0)
      break;
    ret += String.fromCharCode(c2)
    if(c3 == 0)
      break;
    ret += String.fromCharCode(c3)
    if(c4 == 0)
      break;
    ret += String.fromCharCode(c4)
    index+=1;
  }
  return ret;
}

function write_str(buf,index,str)
{
  for(var i = 0; i < str.length; i+= 4)
  {
    c1 = str.charCodeAt(i);
    c2 = str.charCodeAt(i + 1)
    c3 = str.charCodeAt(i + 2)
    c4 = str.charCodeAt(i + 3)
    buf[index + i/4] = c4 << 24
    buf[index + i/4] |= c3 << 16
    buf[index + i/4] |= c2 << 8
    buf[index + i/4] |= c1
  }
}

function read8(addr)
{
  var old_low = cbuf[0x14]
  var old_high = cbuf[0x15]
  cbuf[0x14] = addr.getLowBitsUnsigned()
  cbuf[0x15] = addr.getHighBitsUnsigned()
  var ret = new dcodeIO.Long(rop_buf[0],rop_buf[1],true)
  cbuf[0x14] = old_low
  cbuf[0x15] = old_high
  return ret;
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++)
	{
    	if ((new Date().getTime() - start) > milliseconds)
    	{
    		break;
    	}
  	}
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    return unescape(dc.substring(begin + prefix.length, end));
}

/*
  Wrap two uint32s into double precision
*/

function u2d(low, hi)
{
    if (!_dview)
        _dview = new DataView(new ArrayBuffer(16));

    _dview.setUint32(0, hi);
    _dview.setUint32(4, low);
    return _dview.getFloat64(0)
}

/*
  Unwrap uints from double
*/

function d2u(d)
{
    if (!_dview)
        _dview = new DataView(new ArrayBuffer(16));

    _dview.setFloat64(0, d);
    return { low: _dview.getUint32(4), hi: _dview.getUint32(0) }
}
