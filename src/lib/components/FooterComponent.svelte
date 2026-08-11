<script>
	const crux_logo = '/CruXLogo.png';
</script>

<footer class="footer bg-zinc-900 text-primary-content p-10 z-10">
	<aside>
		<img class="w-14" src={crux_logo} alt="CruX Logo" />

		<p>
			<b>CruX Publication</b> @ UCLA
			<br />
			Providing reliable tech insight since 2024
		</p>
	</aside>
	<!--<nav>
		<h6 class="footer-title">Services</h6>
		<a class="link link-hover" href="/about">Branding</a>
		<a class="link link-hover" href="/about">Design</a>
		<a class="link link-hover" href="/about">Marketing</a>
		<a class="link link-hover" href="/about">Advertisement</a>
	</nav>-->
	<nav>
		<h6 class="footer-title">Company</h6>
		<a class="link link-hover" href="/about">About us</a>
		<a class="link link-hover" href="/about">Contact</a>
	</nav>
	<!--<nav>
		<h6 class="footer-title">Legal</h6>
		<a class="link link-hover" href="/about">Terms of use</a>
		<a class="link link-hover" href="/about">Privacy policy</a>
		<a class="link link-hover" href="/about">Cookie policy</a>
	</nav>-->
	<form>
		<h6 class="footer-title">Newsletter</h6>
		<fieldset class="form-control w-80">
			<label class="label" for="newsletter-email">
				<span class="label-text text-primary-content">Enter your email address</span>
			</label>
			<div class="join">
				<input
					id="newsletter-email"
					type="text"
					placeholder="username@site.com"
					class="input input-bordered join-item"
				/>
				<button class="btn btn-secondary join-item">Subscribe</button>
			</div>
		</fieldset>
	</form>
</footer>
