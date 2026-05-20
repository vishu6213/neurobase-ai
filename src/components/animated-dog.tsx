"use client";

import React from 'react';
import './animated-dog.css';

export function AnimatedDog() {
  return (
    <div className="dog-overlay pointer-events-none fixed bottom-0 right-0 z-[100] scale-[0.2] origin-bottom-right translate-x-2 translate-y-2">
      <div className="container">
        <div className="box">
          <div className="sign"></div>
        </div>
        <div className="dog">
          <div className="dog-group">
            <div className="tongue-open"></div>
            <div className="body-group">
              <div className="dog-box">
                <div className="dog-box-sign">
                  <div className="content"></div>
                </div>
                <div className="bottom-shadow"></div>
                <div className="top-left-shadow"></div>
              </div>
              <div className="tail-group">
                <div className="tail">
                  <div className="tail">
                    <div className="tail">
                      <div className="tail">
                        <div className="tail">
                          <div className="tail">
                            <div className="tail last"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="dog-shape"></div>
            </div>
            <div className="head-group">
              <div className="ear">
                <div className="ear-container">
                  <div className="ear-left"></div>
                </div>
              </div>
              <div className="head"></div>
              <div className="ear right">
                <div className="ear-container">
                  <div className="ear-right"></div>
                </div>
              </div>
              <div className="face">
                <div className="muzzle">
                  <div className="nose"></div>
                  <div className="mouth-close"></div>
                  <div className="mouth-open">
                    <div className="teeth"></div>
                  </div>
                  <div className="mouth-barks"></div>
                </div>
                <div className="eyes">
                  <div className="eye-left">
                    <div className="pupil"></div>
                  </div>
                  <div className="eye-right">
                    <div className="pupil"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="plant-group">
          <div className="pot"></div>
          <div className="plant">
            <div className="stem">
              <div className="leaf"></div>
              <div className="leaf"></div>
              <div className="leaf"></div>
              <div className="leaf"></div>
              <div className="leaf"></div>
            </div>
          </div>
        </div>
        <div className="shapes">
          <div className="red-shape"></div>
          <div className="blue-shape"></div>
          <div className="yellow-shape"></div>
        </div>
      </div>
    </div>
  );
}
