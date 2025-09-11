<script>
	import BackgroundComponent from '$lib/components/BackgroundComponent.svelte';

	const pfp_mark_lee = '/pfps/Mark_Lee_PublicationManager.png';
	const pfp_zach_fischer = '/pfps/Zach_Fischer_Webmaster.png';
	const pfp_aadi_ajmire = '/pfps/Aadi_Ajmire_Interviewer.png';
	const pfp_jonny_dippery = '/pfps/Jonny_Dippery_Writer.jpg';
	const pfp_ting_wu = '/pfps/Ting_Wu_Analyst.png';
	const pfp_abby_lin = '/pfps/Abby_Lin_Author.jpeg';
	const pfp_varun_sekar = '/pfps/Varun_Sekar_TechAnalyst.jpeg';
	const pfp_sofia_mendoza = '/pfps/Sofia_Mendoza_Analyst.JPG';
	const pfp_wyatt_grover = '/pfps/Wyatt_Grover_AssistantWebmaster.JPG';

	const team = [
		{
			name: 'Zach Fischer',
			profilePic: pfp_zach_fischer,
			linkedin: 'https://www.linkedin.com/in/zfischer42/',
			title: 'Webmaster'
		},
		{
			name: 'Aadi Ajmire',
			profilePic: pfp_aadi_ajmire,
			linkedin: 'https://www.linkedin.com/in/aadi-ajmire-077148206/',
			title: 'Interviewer'
		},
		{
			name: 'Jonny Dippery',
			profilePic: pfp_jonny_dippery,
			linkedin: 'https://www.linkedin.com/in/jonathan-dippery/',
			title: 'Author'
		},
		{
			name: 'Xiangting Wu',
			profilePic: pfp_ting_wu,
			linkedin: 'https://www.linkedin.com/in/xiangting-wu-6a38a6223/',
			title: 'Analyst'
		},
		{
			name: 'Abby Lin',
			profilePic: pfp_abby_lin,
			linkedin: 'https://www.instagram.com/abs1626productions/',
			title: 'Author'
		},
		{
			name: 'Varun Sekar',
			profilePic: pfp_varun_sekar,
			linkedin: 'https://www.linkedin.com/in/varun-sekar-2b2247339/',
			title: 'Tech Analyst'
		},
		{
			name: 'Sofia Mendoza',
			profilePic: pfp_sofia_mendoza,
			linkedin: 'https://www.linkedin.com/in/sofia-mendoza-766325344/',
			title: 'Analyst'
		},
		{
			name: 'Wyatt Grover',
			profilePic: pfp_wyatt_grover,
			linkedin: 'https://www.linkedin.com/in/wyatt-grover-6b764122a/',
			title: 'Assistant Webmaster'
		}
	];
</script>

<!-- ABOUT PAGE -->

<BackgroundComponent />

<div
	class="flex flex-col mx-auto p-3 w-5/6 sm:w-3/4 md:w-3/5 lg:w-1/2 mt-5 text-center text-primary z-10"
>
	<!-- Our mission -->
	<div class="p-5 rounded-xl bg-white/85 border mb-8">
		<p class="text-4xl font-bold mb-4">Our Mission</p>

		<p>
			At CruX Publication, we aim to drive progress in neuroscience and technology by delivering
			cutting-edge news and analysis. Our mission is to inform and connect the neurotech community,
			highlight groundbreaking research and innovations, and inspire advancements that enhance
			mental health and cognitive function. Through expert insights and comprehensive coverage, we
			strive to be the go-to source for the latest in neurotechnology.
		</p>
		<br />
		<p>
			CruX UCLA Organization: <a class="underline" href="https://www.cruxucla.com/">cruxucla.com</a>
		</p>
		<p>
			Our parent organization <a class="underline" href="https://neurotechx.com/">neurotechx</a>
		</p>
	</div>

	<!-- Meet the Team -->
	<div class="p-5 rounded-xl bg-white/85 border mb-8">
		<p class="text-4xl font-bold mb-4">Meet the Team</p>

		<div class="flex flex-wrap justify-center gap-4">
			{#each team as member}
				<a href={member.linkedin} target="_blank" class="hover:bg-blue">
					<div
						class="flex flex-col justify-center w-36 transition duration-200 ease-in hover:bg-zinc-200 hover:shadow p-2 rounded-lg"
					>
						<div class="mx-auto avatar mb-1">
							<div class="w-24 rounded-full">
								<img src={member.profilePic} alt="{member.name} profile pic" />
							</div>
						</div>

						<div>
							<p class="text-sm font-bold">{member.name}</p>
							<p class="text-sm">{member.title}</p>
						</div>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<!-- Our mission -->
	<div class="p-5 rounded-xl bg-white/85 border mb-8">
		<p class="text-4xl font-bold mb-4">Contact Us</p>
		<p>
			Email:
			<span class="font-bold">cruxneurotech@g.ucla.edu</span>
		</p>

		<p>
			Visit the <a class="underline" href="https://www.cruxucla.com/">CruX parent website</a>
		</p>
	</div>
</div>
