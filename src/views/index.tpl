<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Backend Challenge</title>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/css/bootstrap.min.css" integrity="sha384-rwoIResjU2yc3z8GV/NPeZWAv56rSmLldC3R/AZzGRnGxQQKnKkoFVhFQhNUwEyJ" crossorigin="anonymous">
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
		<!--<link rel="stylesheet" href="/css/styles.css">-->
	</head>
	<body>
		<div class="container" id="content">
			<h1>Backend Challenge</h1>
			<h5>Available pulls</h5>
			<ul>
				{foreach from=$weathersnaps item=snap}
				<li>
					{$snap.timestamp}
					<small><a href="/api/v1/stations?at={$snap.timestamp}{*2018-02-08T03:00:00*}">All Stations (API)</a></small>
				</li>
				{/foreach}
			</ul>
		</div>
    </div><!-- /.container -->
		<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
	</body>
</html>
