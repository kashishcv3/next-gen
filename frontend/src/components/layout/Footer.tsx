'use client';

import React from 'react';

export default function Footer() {
  return (
    <div id="footer" className="well well-sm">
      <div style={{ float: 'left' }} id="copyright">
        <b>&copy;{new Date().getFullYear()} COMMERCEV3, INC.</b>
      </div>
      <div style={{ float: 'right' }} id="phone">
        <a href="tel:8887978275" target="_blank" rel="noopener noreferrer">888.797.8275</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <a href="tel:3122618888" target="_blank" rel="noopener noreferrer">312.261.8888</a>
      </div>
    </div>
  );
}
