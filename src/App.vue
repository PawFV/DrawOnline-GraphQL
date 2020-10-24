<template>
  <div id="app" class="app">
    <div id="nav" class="nav">
      <RouterLink to="/">Chat Rooms</RouterLink>
      <div class="user">
        <h3>User: {{ $store.state.user.name }}</h3>
      </div>
    </div>
    <RouterView />
  </div>
</template>

<style>
.app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.nav {
  padding: 30px;
  position: relative;
}

.nav a {
  font-weight: bold;
  color: #2c3e50;
}

.nav a.router-link-exact-active {
  color: #42b983;
}
.user {
  position: absolute;
  right: 30px;
  top: 0;
}
</style>
