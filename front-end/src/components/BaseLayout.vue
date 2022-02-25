<template>
  <div class="row">
    <div class="col-sm-auto bg-light sticky-top">
      <!-- sidebar -->
      <slot name="sidebar"></slot>
    </div>

    <div class="col-sm py-2 min-vh-100">
      <!-- main content -->
      <main>
        <slot></slot>
      </main>
    </div>
  </div>
</template>
