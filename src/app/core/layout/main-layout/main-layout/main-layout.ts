import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../../header/header/header';
import { Sidebar } from '../../sidebar/sidebar/sidebar';
import { Footer } from "../../footer/footer/footer";

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterModule, Header, Sidebar, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  isSidebarOpen = false;
  isMobileView = false;

  ngOnInit() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobileView = window.innerWidth < 1024; // lg breakpoint
    if (!this.isMobileView) {
      this.isSidebarOpen = true; // Always show sidebar on desktop
    } else {
      this.isSidebarOpen = false; // Hide sidebar on mobile by default
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}