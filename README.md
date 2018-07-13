# Madrid traffic connector

This connector load in [CARTO](https://carto.com) traffic data provided by [Madrid's Open Data Portal](https://datos.madrid.es/).

It's deployed using serverless. Thus, it could run in [AWS Lambda](https://aws.amazon.com/lambda).

A really basic map visualization has been created in CARTO: https://geographica.carto.com/u/alasarr/builder/c4256311-f319-46bd-9242-34da34e87356. It's updated every 2 minutes.

## Connectors

The following connectors are available:
- cameras
- incidences
- intensitylines
- intensitypois
- servicelevel
- trafficlightsacustw
- trafficlightsred

## Testing connectors

You can test in your local environment with this CLI tool:

```
node run_connector.js -c [cameras|incidences|intensitylines|intensitypois|servicelevel|trafficlightsacustw|trafficlightsred]
```

Example:
```
CARTO_USERNAME=cartouser CARTO_API_KEY=cartoapikey node run_connector.js -c cameras
```

## AWS Lambda deploy

AWS Lambda deploy function:

```
$ serverless deploy -v
```

AWS Lambda  invoke function:

```
$ serverless invoke -f myfunction -l
```

AWS Lambda update function (without AWS CloudFormation because is slow):

```
$ serverless deploy function -f myfunction -v
