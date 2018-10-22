# Madrid traffic connector

This connector loads in [CARTO](https://carto.com) traffic data provided by [Madrid's Open Data Portal](https://datos.madrid.es/).

It's deployed using serverless. Thus, it could run in [AWS Lambda](https://aws.amazon.com/lambda).

## Connectors

The following connectors are available:
- cameras
- incidences
- intensitylines
- intensitypois
- servicelevel
- trafficlightsacustw
- trafficlightsred
- streetsgeocoder (inverse geocoding for incidences)
- pollutionincidences

## Testing connectors

You can test in your local environment with this CLI tool:

```
node run_connector.js -c [cameras|incidences|intensitylines|intensitypois|servicelevel|trafficlightsacustw|trafficlightsred|streetsgeocoder|pollutionincidences]
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
