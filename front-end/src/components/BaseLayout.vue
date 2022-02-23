<template>
  <div class="col-sm-auto bg-light sticky-top">
    <!-- sidebar -->
    <slot name="sidebar"></slot>
  </div>

  <div class="col-sm p-3 min-vh-100">
    <!-- main content -->
    <main>
      <slot></slot>
    </main>
  </div>
</template>
