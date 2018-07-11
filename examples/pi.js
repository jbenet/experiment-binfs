#!/usr/bin/env node

var increment = 100
for (var i = 0; true; i += increment) {
  var digits = piNDigits(i, increment)
  process.stdout.write(digits)
}

function piNDigits(offset, len) {
  if (offset < 0 || len < 0) {
    throw new Error("bad params")
  }

  var got = ''
  for (; got.length < len; offset++) {
    got += getHexDigit(offset).join('')
  }
  return got.slice(0, len) // maybe truncate
}

// This is a port of the C-language reference implementation, which can be
// found here: http://www.experimentalmath.info/bbp-codes/piqpr8.c

/*
    This program implements the BBP algorithm to generate a few hexadecimal
    digits beginning immediately after a given position id, or in other words
    beginning at position id + 1.  On most systems using IEEE 64-bit floating-
    point arithmetic, this code works correctly so long as d is less than
    approximately 1.18 x 10^7.  If 80-bit arithmetic can be employed, this limit
    is significantly higher.  Whatever arithmetic is used, results for a given
    position id can be checked by repeating with id-1 or id+1, and verifying
    that the hex digits perfectly overlap with an offset of one, except possibly
    for a few trailing digits.  The resulting fractions are typically accurate
    to at least 11 decimal digits, and to at least 9 hex digits.
*/
/*  David H. Bailey     2006-09-08 */
function getHexDigit(id) {
  var pid, s1, s2, s3, s4;
  var NHX = 16;
  var chx;
  /*  id is the digit position.  Digits generated follow immediately after id. */
  s1 = series(1, id);
  s2 = series(4, id);
  s3 = series(5, id);
  s4 = series(6, id);
  pid = 4 * s1 - 2 * s2 - s3 - s4;
  pid = pid - Math.trunc(pid) + 1;
  chx = ihex(pid, NHX);
  // printf (" position = %i\n fraction = %.15f \n hex digits =  %10.10s\n",
  // id, pid, chx);
  // console.log(chx);
  return chx;
}

function ihex(x, nhx) {
  /*  This returns the first nhx hex digits of the fraction of x. */
  var i;
  var y;
  var hx = "0123456789ABCDEF";
  var chx = [];
  y = Math.abs(x);
  for (i = 0; i < nhx; i++) {
    y = 16 * (y - Math.floor(y));
    chx[i] = hx[Math.trunc(y)];
  }
  return chx;
}

function series(m, id) {
  /*  This routine evaluates the series  sum_k 16^(id-k)/(8*k+m)
      using the modular exponentiation technique. */
  var k;
  var ak, eps, p, s, t;
  var eps = 1e-17;
  s = 0;
  /*  Sum the series up to id. */
  for (k = 0; k < id; k++) {
    ak = 8 * k + m;
    p = id - k;
    t = expm(p, ak);
    s = s + t / ak;
    s = s - Math.trunc(s);
  }
  /*  Compute a few terms where k >= id. */
  for (k = id; k <= id + 100; k++) {
    ak = 8 * k + m;
    t = Math.pow(16, (id - k)) / ak;
    if (t < eps) break;
    s = s + t;
    s = s - Math.trunc(s);
  }
  return s;
}

function expm(p, ak) {
  /*  expm = 16^p mod ak.  This routine uses the left-to-right binary
      exponentiation scheme. */
  var i, j;
  var p1, pt, r;
  var ntp = 25;
  expm.tp = [];
  expm.tp1 = 0;
  /*  If this is the first call to expm, fill the power of two table tp. */
  if (expm.tp1 == 0) {
    expm.tp1 = 1;
    expm.tp[0] = 1;
    for (i = 1; i < ntp; i++) expm.tp[i] = 2 * expm.tp[i - 1];
  }
  if (ak == 1) return 0;
  /*  Find the greatest power of two less than or equal to p. */
  for (i = 0; i < ntp; i++)
    if (expm.tp[i] > p) break;
  pt = expm.tp[i - 1];
  p1 = p;
  r = 1;
  /*  Perform binary exponentiation algorithm modulo ak. */
  for (j = 1; j <= i; j++) {
    if (p1 >= pt) {
      r = 16 * r;
      r = r - Math.trunc(r / ak) * ak;
      p1 = p1 - pt;
    }
    pt = 0.5 * pt;
    if (pt >= 1) {
      r = r * r;
      r = r - Math.trunc(r / ak) * ak;
    }
  }
  return r;
}